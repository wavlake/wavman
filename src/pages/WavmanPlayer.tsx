import {
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
  QR_VIEW,
  ZAP_AMOUNT_VIEW,
  ZAP_COMMENT_VIEW,
  coerceEnvVarToBool,
} from "../lib/shared";
import Logo from "./Logo";
import PlayerControls from "./PlayerControls/PlayerControls";
import { Button } from "./PlayerControls/button";
import Screen from "./Screen/Screen";
import { useRelay } from "@/nostr";
import { getInvoice } from "@/nostr/zapLogic";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export interface Form {
  content: string;
  satAmount: number;
}

const randomTrackFeatureFlag = coerceEnvVarToBool(
  process.env.NEXT_PUBLIC_ENABLE_RANDOM_TRACKS
);
const randomSHA256String = (length: number) => {
  const alphanumericString = Array.from(Array(length + 30), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
  const SHA256Regex = /[^A-Fa-f0-9-]/g;
  return alphanumericString.replace(SHA256Regex, "").slice(0, length);
};

const WavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChars, setRandomChars] = useState<string[]>(
    Array.from(randomSHA256String(30))
  );

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();
  // Get a batch of tracks
  const { data: tracks, loading: tracksLoading } = useListEvents([
    {
      kinds: [32123],
      ...(randomTrackFeatureFlag ? { ["#f"]: randomChars } : {}),
      limit: 40,
    },
  ]);

  // Post a comment mutation
  const [
    publishEvent,
    {
      data: postedComment,
      loading: publishEventLoading,
      error: publishEventError,
    },
  ] = usePublishEvent();
  const [trackIndex, setTrackIndex] = useState(0);

  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();
  const [paymentRequest, setpaymentRequest] = useState("");
  const shouldSkipPaymentReceipt = !paymentRequest;
  // ZapReceipt Listener
  const { allEvents: zapReceipts, loading: zapReceiptsLoading } =
    useEventSubscription([
      { kinds: [9735], ["#e"]: [nowPlayingTrack?.id || ""] },
    ]);
  // Get track comments, skip till a track is ready
  const shouldSkipComments = !nowPlayingTrack;
  const { allEvents: comments, loading: commentsLoading } =
    useEventSubscription(
      [{ ["#e"]: [nowPlayingTrack?.id || ""], limit: 20 }],
      shouldSkipComments
    );

  ///////// UI /////////
  const pickRandomTrack = (tracks: Event[]) => {
    setNowPlayingTrack(tracks[trackIndex]);
    setTrackIndex(trackIndex + 1);
    // setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };
  const turnOnPlayer = () => {
    setCurrentPage(PLAYER_VIEW);
  };

  // The player currently auto turns on when tracks are loaded
  // Tracks load automatically when the page loads
  useEffect(() => {
    if (tracks?.length) {
      pickRandomTrack(tracks);
      turnOnPlayer();
    }
  }, [tracks]);

  const skipHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks);
  };

  const zapHandler = async () => {
    setZapError("");
    setPageViewAndResetSelectedAction(ZAP_AMOUNT_VIEW);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };

  ///////// NAVIGATION /////////
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<PageView>(SPLASH_VIEW);
  const setPageViewAndResetSelectedAction = (pageView: PageView) => {
    resetSelectionOnPageChange(pageView, setSelectedActionIndex);
    setCurrentPage(pageView);
  };
  const toggleViewHandler = (pageView: PageView) => {
    setPageViewAndResetSelectedAction(pageView);
  };
  const methods = useForm({
    defaultValues: {
      content: "",
      satAmount: 100,
    },
  });
  const content = methods.watch("content");
  const satAmount = methods.watch("satAmount");

  const [zapError, setZapError] = useState("");
  const isFormValid = (): boolean => {
    const zapScreenError = "Must zap more than zero sats";
    if (!satAmount || satAmount <= 0) {
      setZapError(zapScreenError);
      return false;
    } else {
      setZapError("");
      return true;
    }
  };
  const [commenterPubKey, setCommenterPubKey] = useState<string | undefined>();

  const setUserPubKey = () => {
    window.nostr
      ?.getPublicKey?.()
      .then((pubKey) => setCommenterPubKey(pubKey))
      .catch((e: string) => console.log(e));
  };

  const confirmZapAmount = () => {
    setPageViewAndResetSelectedAction(ZAP_COMMENT_VIEW);
  };
  const confirmZapComment = async () => {
    processZap();
  };

  const processZap = async () => {
    setPageViewAndResetSelectedAction(QR_VIEW);

    if (!nowPlayingTrack) {
      console.log("No track is playing");
      return;
    }
    if (!isFormValid()) return;
    const invoice = await getInvoice({
      nowPlayingTrack,
      satAmount,
      content,
    });
    if (!invoice) {
      console.log("Error retrieving invoice");
      setPageViewAndResetSelectedAction(ZAP_AMOUNT_VIEW);
      return;
    }
    const { enabled } = (await window.webln?.enable()) || {};
    if (enabled) {
      // use webLN to pay
      try {
        await window.webln?.sendPayment(invoice);
      } catch (e) {
        // failed to pay invoice, present QR code
        setpaymentRequest(invoice);
      }
    } else {
      // webLN not available? present QR code
      setpaymentRequest(invoice);
    }
  };

  return (
    // Page Container
    <>
      <FormProvider {...methods}>
        <form>
          <div className="relative mt-4 grid h-max w-80 border-8 border-black bg-wavgray">
            <div className="mx-auto max-w-xs">
              <Screen
                zapError={zapError}
                nowPlayingTrack={nowPlayingTrack}
                isPlaying={isPlaying}
                commentsLoading={commentsLoading}
                comments={zapReceipts || []}
                currentPage={currentPage}
                paymentRequest={paymentRequest}
                selectedActionIndex={selectedActionIndex}
                commenterPubKey={commenterPubKey}
                skipHandler={skipHandler}
              />
              <Logo />
              <PlayerControls
                currentPage={currentPage}
                selectedActionIndex={selectedActionIndex}
                setSelectedActionIndex={setSelectedActionIndex}
                skipHandler={skipHandler}
                zapHandler={zapHandler}
                playHandler={playHandler}
                toggleViewHandler={toggleViewHandler}
                confirmZapAmount={confirmZapAmount}
                confirmZapComment={confirmZapComment}
                commenterPublicKey={commenterPubKey}
              />
            </div>
            {/* Player Border Lines & Cutouts */}
            <div className="absolute left-0 top-0 h-4 w-2 bg-black"></div>
            <div className="absolute right-0 top-0 h-4 w-2 bg-black"></div>
            <div className="absolute bottom-0 left-0 h-4 w-2 bg-black"></div>
            <div className="absolute bottom-0 right-0 h-4 w-2 bg-black"></div>
            <div className="absolute -left-2 -top-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -right-2 -top-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -bottom-2 -left-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -bottom-2 -right-2 h-6 w-2 bg-wavpink"></div>
          </div>
        </form>
      </FormProvider>
      <Button
        className="mx-auto mt-4 w-28 self-start bg-white"
        clickHandler={setUserPubKey}
      >
        Login
      </Button>
    </>
  );
};

export default WavmanPlayer;
