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
    getHexCharacters(randomTrackFeatureFlag ? 4 : hexChars.length)
  );
  const [kind1Events, setKind1Events] = useState<Event[]>([]);
  const { relay, useListEvents, useEventSubscription } = useRelay();

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
      listEvents(relay, kind1Filter).then((events) => {
        events && setKind1Events((prev) => [...prev, ...events]);
      });
    }
  }, [randomChars, trackPubKey, relay]);

  const [kind1NowPlaying, setKind1NowPlaying] = useState<Event>();
  const [paymentRequest, setPaymentRequest] = useState("");
  const [trackIndex, setTrackIndex] = useState(0);

  const pickRandomTrack = () => {
    if (!kind1NowPlaying) return;
    if (randomTrackFeatureFlag) {
      setKind1NowPlaying(
        kind1Events[Math.floor(Math.random() * kind1Events.length)]
      );
    } else {
      setKind1NowPlaying(kind1Events[trackIndex + 1]);
      setTrackIndex(trackIndex + 1);
    }
  };
  useEffect(() => {
    setKind1NowPlaying(kind1Events[0]);
  }, [kind1Events]);

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
