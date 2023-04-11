import {
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
  QR_VIEW,
  ZAP_VIEW,
  COMMENTS_VIEW,
} from "../lib/shared";
import Logo from "./Logo";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screen from "./Screen/Screen";
import { useWebLN } from "@/lightning/useWebLN";
import { useRelay } from "@/nostr";
import { useNIP07Login } from "@/nostr/useNIP07Login";
import { getInvoice, publishCommentEvent } from "@/nostr/zapLogic";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export interface Form {
  content: string;
  satAmount: number;
}

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
  const [randomChar, setRandomChar] = useState<string[]>(
    Array.from(randomSHA256String(30))
  );

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();

  // Get a batch of tracks
  const { data: tracks, loading: tracksLoading } = useListEvents([
    { kinds: [32123], ["#f"]: randomChar },
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
  const { lastEvent: paymentReceipt, loading: paymentReceiptLoading } =
    useEventSubscription(
      [{ kinds: [9735], ["#bolt11"]: [paymentRequest] }],
      shouldSkipPaymentReceipt
    );
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
    setPageViewAndResetSelectedAction(ZAP_VIEW);
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
    const zapScreenError = "Do at least one, please";
    if (!satAmount && !content) {
      setZapError(zapScreenError);
      return false;
    } else {
      setZapError("");
      return true;
    }
  };
  const { getPublicKey, signEvent } = useNIP07Login();
  const [commenterPubKey, setCommenterPubKey] = useState<string | undefined>();
  const setThePubKey = () => {
    getPublicKey?.().then((pubKey) => setCommenterPubKey(pubKey));
  };
  useEffect(() => {
    setThePubKey();
  }, [getPublicKey, setCommenterPubKey]);

  const webLN = useWebLN();
  const confirmZap = async () => {
    setPageViewAndResetSelectedAction(QR_VIEW);

    if (!nowPlayingTrack) {
      console.log("No track is playing");
      return;
    }
    if (!isFormValid() || !signEvent || !commenterPubKey) return;

    if (content) {
      // publish kind 1 event comment, aka a reply
      publishCommentEvent({
        commenterPubKey,
        signEvent,
        content,
        nowPlayingTrack,
        publishEvent,
      });
    }
    if (satAmount && satAmount > 0) {
      const invoice = await getInvoice({
        nowPlayingTrack,
        satAmount,
        content,
        commenterPubKey,
        signEvent,
      });
      if (!invoice) {
        console.log("Error retrieving invoice");
        setPageViewAndResetSelectedAction(ZAP_VIEW);
        return;
      }
      if (webLN.sendPayment) {
        // use webLN to pay
        try {
          await webLN.sendPayment(invoice);
        } catch (e) {
          // failed to pay invoice, present QR code
          setpaymentRequest(invoice);
        }
      } else {
        // webLN not available? present QR code
        setpaymentRequest(invoice);
      }
    }
  };

  return (
    // Page Container
    <FormProvider {...methods}>
      <form>
        <div className="h-128 relative mx-auto mt-4 grid w-80 border-8 border-black bg-wavgray">
          <div className="mx-auto max-w-xs">
            <Screen
              zapError={zapError}
              nowPlayingTrack={nowPlayingTrack}
              isPlaying={isPlaying}
              commentsLoading={commentsLoading}
              comments={comments || []}
              currentPage={currentPage}
              paymentRequest={paymentRequest}
              selectedActionIndex={selectedActionIndex}
              commenterPubKey={commenterPubKey}
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
              confirmZap={confirmZap}
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
  );
};

export default WavmanPlayer;
