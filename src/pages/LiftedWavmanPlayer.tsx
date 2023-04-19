import { coerceEnvVarToBool } from "../lib/shared";
import WavmanPlayer from "./WavmanPlayer";
import { useRelay } from "@/nostr";
import { listEvents } from "@/nostr/zapUtils";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";

export interface Form {
  content: string;
  satAmount: number;
}

const randomTrackFeatureFlag = coerceEnvVarToBool(
  process.env.NEXT_PUBLIC_ENABLE_RANDOM_TRACKS
);
const trackPubKey = process.env.NEXT_PUBLIC_TRACK_EVENT_PUBKEY || "";

const hexChars = "0123456789abcdef";
const getHexCharacters = (length: number): string[] => {
  // all possible hex characters
  const outputSet = new Set<string>();
  const cappedLength = Math.min(length, hexChars.length);
  while (outputSet.size < cappedLength) {
    outputSet.add(hexChars.charAt(Math.floor(Math.random() * hexChars.length)));
  }
  return Array.from(outputSet);
};

const LiftedWavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChars, setRandomChars] = useState<string[]>(
    getHexCharacters(randomTrackFeatureFlag ? 10 : hexChars.length)
  );
  const [batchOfKind1Events, setBatchOfKind1Events] = useState<Event[]>([]);
  const [kind1UnSeen, setKind1UnSeen] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { relay, useEventSubscription } = useRelay();

  // this should be switched to querying for a tags, but a tag values are different for each track
  // add a new tag to the track to make it easier to query for?
  // Get a batch of kind 1 events
  useEffect(() => {
    const kind1Filter = [
      {
        kinds: [1],
        ["#f"]: randomChars,
        ["#p"]: [trackPubKey],
        limit: 100,
      },
    ];
    if (relay) {
      setLoadingEvents(true);
      listEvents(relay, kind1Filter).then((events) => {
        events && setBatchOfKind1Events(events);
        setLoadingEvents(false);
      }).catch((err) => {
        console.error(err);
        setLoadingEvents(false);
      });
    }
  }, [randomChars, trackPubKey, relay]);

  const [kind1NowPlaying, setKind1NowPlaying] = useState<Event>();
  const [paymentRequest, setPaymentRequest] = useState("");
  const [trackIndex, setTrackIndex] = useState(0);

  const pickRandomTrack = () => {
    if (randomTrackFeatureFlag) {
      const nextTrackIndex = Math.floor(Math.random() * kind1UnSeen.length);
      setKind1NowPlaying(kind1UnSeen[nextTrackIndex]);
      // remove the last track from the unSeen list
      setKind1UnSeen((prev) => {
        const newUnSeen = [...prev];
        newUnSeen.splice(nextTrackIndex, 1);
        return newUnSeen;
      });
    } else {
      // eventually this will reach the end of the list
      // this is only meant to be used in development
      setKind1NowPlaying(kind1UnSeen[trackIndex + 1]);
      setTrackIndex(trackIndex + 1);
    }
  };

  useEffect(() => {
    // when a new batch of kind 1 events is ready, add to unSeenList
    setKind1UnSeen(prev => [...prev, ...batchOfKind1Events]);
  }, [batchOfKind1Events]);

  useEffect(() => {
    if (kind1UnSeen.length === 0 && !loadingEvents) {
      console.log(`you've listend to all the TextTrackList, please refresh the page to grab more :)`);
      // TODO
      // we've seen all the tracks, make a call to grab another batch
      // setRandomChars(getHexCharacters(4));
    }
  }, [kind1UnSeen]);

  // ZapReceipt Listener (aka zap comments)
  const {
    allEvents: zapReceipts,
    lastEvent: lastZapReceipt,
    loading: zapReceiptsLoading,
  } = useEventSubscription(
    [{ kinds: [9735], ["#e"]: [kind1NowPlaying?.id || ""] }],
    !batchOfKind1Events.length
  );

  return (
    <WavmanPlayer
      kind1UnSeen={kind1UnSeen}
      kind1NowPlaying={kind1NowPlaying}
      pickRandomTrack={pickRandomTrack}
      zapReceipts={zapReceipts}
      lastZapReceipt={lastZapReceipt}
      zapReceiptsLoading={zapReceiptsLoading}
      paymentRequest={paymentRequest}
      setPaymentRequest={setPaymentRequest}
    />
  );
};

export default LiftedWavmanPlayer;
