import { coerceEnvVarToBool } from "../lib/shared";
import { useRelay } from "@/nostr";
import { useState } from "react";
import WavmanPlayer from "./WavmanPlayer";

export interface Form {
  content: string;
  satAmount: number;
}

const randomTrackFeatureFlag = coerceEnvVarToBool(
  process.env.NEXT_PUBLIC_ENABLE_RANDOM_TRACKS
);
const trackPubKey = process.env.NEXT_PUBLIC_TRACK_EVENT_PUBKEY || "";

const hexChars = '0123456789abcdefABCDEF';
const getHexCharacters = (length: number): string[] => {
  // all possible hex characters
  const outputSet = new Set<string>();
  const cappedLength = Math.min(length, hexChars.length);
  while (outputSet.size < cappedLength) {
    outputSet.add(hexChars.charAt(Math.floor(Math.random() * hexChars.length)));
  }
  return Array.from(outputSet);
}

const LiftedWavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChars, setRandomChars] = useState<string[]>(getHexCharacters(randomTrackFeatureFlag ? 4 : hexChars.length));

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent, reconnect } = useRelay();

  // this should be switched to querying for a tags, but a tag values are different for each track
  // add a new tag to the track to make it easier to query for?
  // Get a batch of kind 1 events
  const { data: kind1Events, loading: tracksLoading } =
    useListEvents([
      {
        kinds: [1],
        ["#f"]: randomChars,
        ["#p"]: [trackPubKey],
        limit: 10,
      },
    ]);

  const kind1NowPlaying = kind1Events?.[0];
  // 32123 event listener
  const allkind32123DTags = kind1Events?.map((track) => {
    const [tagName, kind1ATag] =
      track.tags?.find(([tagType]) => tagType === "a") || [];
    return kind1ATag?.replace("32123:", "")?.split(":")?.[1];
  });
  // get the kind 1's replaceable 32123 event
  // TODO implement replaceability and test to make sure the most recent is consumed here
  const {
    data: kind32123Events,
    loading: kind32123EventsLoading,
  } = useListEvents(
    [
      {
        kinds: [32123],
        ["#d"]: allkind32123DTags ?? [],
        // limit: 4,
      },
    ],
    tracksLoading,
  );

  const [paymentRequest, setPaymentRequest] = useState("");

  // ZapReceipt Listener (aka zap comments)
  const {
    allEvents: zapReceipts,
    lastEvent: lastZapReceipt,
    loading: zapReceiptsLoading,
  } = useEventSubscription(
    [{ kinds: [9735], ["#e"]: [kind1NowPlaying?.id || ""]}],
    tracksLoading,
  );

  console.log({ kind1Events, kind32123Events, zapReceiptsLoading });
  const [current] = kind32123Events || [];
  
  const kind32123NowPlaying = kind32123Events?.[0];
  if (!kind1Events?.length || !kind32123NowPlaying) return <>loading</>

  return (
    <WavmanPlayer
      kind1Events={kind1Events}
      kind32123NowPlaying={kind32123NowPlaying}
      zapReceipts={zapReceipts}
      lastZapReceipt={lastZapReceipt}
      zapReceiptsLoading={zapReceiptsLoading}
      tracksLoading={tracksLoading}
      paymentRequest={paymentRequest}
      setPaymentRequest={setPaymentRequest}
    />
  );
};

export default LiftedWavmanPlayer;
