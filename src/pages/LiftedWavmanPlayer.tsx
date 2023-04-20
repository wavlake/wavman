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

const RANDOM_CHAR_FILTER_AMOUNT = 3;
const randomTrackFeatureFlag = coerceEnvVarToBool(
  process.env.NEXT_PUBLIC_ENABLE_RANDOM_TRACKS
  );
const KIND1_LIMIT = randomTrackFeatureFlag ? 100 : 10;
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

const shuffleArray: <T>(array: T[]) => T[] = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [
      shuffledArray[j],
      shuffledArray[i],
    ];
  }
  return shuffledArray;
};

const LiftedWavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChars, setRandomChars] = useState<string[]>(
    getHexCharacters(randomTrackFeatureFlag ? RANDOM_CHAR_FILTER_AMOUNT : hexChars.length)
  );
  const [kind1Events, setKind1Events] = useState<Event[]>([]);
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
        // limit: KIND1_LIMIT,
      },
    ];
    if (relay) {
      setLoadingEvents(true);
      listEvents(relay, kind1Filter).then((events) => {
        if (randomTrackFeatureFlag) {
          const shuffledArray = shuffleArray(events ?? []);
          setKind1Events(prev => [...prev, ...shuffledArray]);
        } else {
          setKind1Events(prev => [...prev, ...events ?? []]);
        }
        setLoadingEvents(false);
      }).catch((err) => {
        console.error(err);
        setLoadingEvents(false);
      });
    }
  }, [randomChars, trackPubKey, relay]);

  const [kind1NowPlaying, setKind1NowPlaying] = useState<Event>();
  const [paymentRequest, setPaymentRequest] = useState("");

  // start at index 1
  // index 0 is programmatically consumed below in the useEffect
  const [trackIndex, setTrackIndex] = useState(1);

  const pickRandomTrack = () => {
    setKind1NowPlaying(kind1Events[trackIndex]);
    setTrackIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (trackIndex === 1 && kind1Events[0]) {
      // set the first track as the now playing track
      setKind1NowPlaying(kind1Events[0]);
    }
    if (trackIndex > (kind1Events.length - 1) && kind1NowPlaying) {
      console.log(`you've listend to all of the tracks that were loaded, please refresh the page to load more :)`);
      // TODO pre-emptively grab more tracks when user is near end of list
      // we've seen all the tracks, make a call to grab another batch
      // setRandomChars(getHexCharacters(4));
    }
  }, [trackIndex, kind1Events]);

  // ZapReceipt Listener (aka zap comments)
  const {
    allEvents: zapReceipts,
    lastEvent: lastZapReceipt,
    loading: zapReceiptsLoading,
  } = useEventSubscription(
    [{ kinds: [9735], ["#e"]: [kind1NowPlaying?.id || ""] }],
    !kind1Events.length
  );

  return (
    <WavmanPlayer
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
