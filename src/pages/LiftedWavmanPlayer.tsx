import {
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
  QR_VIEW,
  ZAP_AMOUNT_VIEW,
  ZAP_COMMENT_VIEW,
  coerceEnvVarToBool,
  COMMENTS_VIEW,
} from "../lib/shared";
import Links from "./Links";
import Logo from "./Logo";
import Nip07InfoModal from "./Nip07InfoModal";
import Button from "./PlayerControls/Button";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screen from "./Screen/Screen";
import { useRelay } from "@/nostr";
import { getInvoice } from "@/nostr/zapLogic";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
  const { allEvents: kind1Tracks, loading: tracksLoading } =
    useEventSubscription([
      {
        kinds: [1],
        ["#f"]: randomChars,
        ["#p"]: [trackPubKey],
        limit: 100,
      },
    ]);

  const kind1NowPlaying = kind1Tracks[0];
  // 32123 event listener
  const [tagName, kind1ATag] =
    kind1NowPlaying?.tags?.find(([tagType]) => tagType === "a") || [];

  const kind32123DTag = kind1ATag?.replace("32123:", "")?.split(":")?.[1];
  const skipKind32123 = !kind32123DTag;
  // get the kind 1's replaceable 32123 event
  // TODO implement replaceability and test to make sure the most recent is consumed here
  const {
    allEvents: kind32123NowPlaying,
    loading: kind32123NowPlayingLoading,
  } = useEventSubscription(
    [
      {
        kinds: [32123],
        ["#d"]: [kind32123DTag],
        limit: 4,
      },
    ],
    skipKind32123
  );

  const [paymentRequest, setPaymentRequest] = useState("");

  // ZapReceipt Listener (aka zap comments)
  const skipZapReceipts = !kind1NowPlaying?.id;
  const {
    allEvents: zapReceipts,
    lastEvent: lastZapReceipt,
    loading: zapReceiptsLoading,
  } = useEventSubscription(
    [{ kinds: [9735], ["#e"]: [kind1NowPlaying?.id || ""]}],
    skipZapReceipts,
    undefined,
    paymentRequest,
  );

  const [current] = kind32123NowPlaying

  return (
    <WavmanPlayer
      kind1Tracks={kind1Tracks}
      kind32123NowPlaying={current}
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
