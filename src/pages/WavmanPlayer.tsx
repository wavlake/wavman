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
import { WavlakeEventContent } from "@/nostr";
import { getInvoice } from "@/nostr/zapLogic";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ReactPlayerWrapper from "./ReactPlayerWrapper";

export interface Form {
  content: string;
  satAmount: number;
}

const randomTrackFeatureFlag = coerceEnvVarToBool(process.env.NEXT_PUBLIC_ENABLE_RANDOM_TRACKS);

const WavmanPlayer: React.FC<{
  kind1Events: Event[];
  kind32123NowPlaying: Event;
  zapReceipts: Event[];
  lastZapReceipt?: Event;
  zapReceiptsLoading: boolean;
  tracksLoading: boolean;
  paymentRequest: string;
  setPaymentRequest: (paymentRequest: string) => void;
}> = ({
  kind1Events,
  kind32123NowPlaying: contentNowPlaying,
  zapReceipts,
  lastZapReceipt,
  zapReceiptsLoading,
  tracksLoading,
  paymentRequest,
  setPaymentRequest,
}) => {
  const [kind1NowPlaying, setKind1NowPlaying] = useState<Event>();
  const [trackIndex, setTrackIndex] = useState(0);

  ///////// UI /////////
  const pickRandomTrack = (kind1Events: Event[]) => {
    if (randomTrackFeatureFlag) {
      setKind1NowPlaying(
        kind1Events[Math.floor(Math.random() * kind1Events.length)]
      );
    } else {
      setKind1NowPlaying(kind1Events[trackIndex + 1]);
      setTrackIndex(trackIndex + 1);
    }
  };
  const turnOnPlayer = () => {
    setCurrentPage(PLAYER_VIEW);
  };

  // The player currently auto turns on when tracks are loaded
  // Tracks load automatically when the page loads
  useEffect(() => {
    if (kind1Events?.length && !tracksLoading) {
      pickRandomTrack(kind1Events);
      turnOnPlayer();
    }
  }, [kind1Events, tracksLoading]);

  const skipHandler = () => {
    if (kind1Events?.length) pickRandomTrack(kind1Events);
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
  const centerButtonPressedState = useState<boolean | undefined>(false);
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

  const confirmZapAmount = () => {
    setPageViewAndResetSelectedAction(ZAP_COMMENT_VIEW);
  };
  const confirmZapComment = async () => {
    processZap();
  };

  const processZap = async () => {
    setPaymentRequest("");
    setPageViewAndResetSelectedAction(QR_VIEW);

    if (!kind1NowPlaying) {
      console.log("No track is playing");
      return;
    }
    if (!isFormValid()) return;
    if (satAmount && satAmount > 0) {
      const invoice = await getInvoice({
        nowPlayingTrack: kind1NowPlaying,
        satAmount,
        content,
      });
      if (!invoice) {
        setPageViewAndResetSelectedAction(ZAP_AMOUNT_VIEW);
        return;
      }
      setPaymentRequest(invoice);
      try {
        // use webLN to pay
        const { enabled } = (await window.webln?.enable()) || {};
        if (enabled) {
          await window.webln?.sendPayment(invoice);
        }
      } catch (e) {
        console.log("Error paying via webln:", e);
      }
    }
  };

  useEffect(() => {
    const [bolt11, lastPaymentRequest] =
      lastZapReceipt?.tags.find(([tagName]) => tagName === "bolt11") || [];
    // If user is on the QR_VIEW and a zap receipt is received for the current payment request
    if (currentPage === QR_VIEW && paymentRequest === lastPaymentRequest) {
      setPageViewAndResetSelectedAction(COMMENTS_VIEW);
      // reset payment request so that the payment request listener will know to reconnect next time
      setPaymentRequest("");
    }
  }, [lastZapReceipt, paymentRequest]);

  const trackContent: WavlakeEventContent = JSON.parse(
    contentNowPlaying?.content || "{}"
  );
  return (
    // Page Container
    <>
      <ReactPlayerWrapper
        url={trackContent.enclosure}
        isPlaying={isPlaying}
        onEnded={skipHandler}
      />
      <FormProvider {...methods}>
        <form>
          <div className="relative mx-auto mt-4 grid h-[34rem] w-[22rem] justify-center border-8 border-black bg-wavgray md:mt-20">
            <Screen
              zapError={zapError}
              nowPlayingTrackContent={trackContent}
              isPlaying={isPlaying}
              commentsLoading={zapReceiptsLoading}
              comments={zapReceipts}
              currentPage={currentPage}
              paymentRequest={paymentRequest}
              selectedActionIndex={selectedActionIndex}
              commenterPubKey={commenterPubKey}
              isCenterButtonPressed={centerButtonPressedState[0] || false}
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
              centerButtonPressedState={centerButtonPressedState}
              commenterPublicKey={commenterPubKey}
            />
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
      <Nip07InfoModal
        setCommenterPubKey={setCommenterPubKey}
        commenterPubKey={commenterPubKey}
      />
      <div className="mx-auto mt-8 flex">
        <Links />
      </div>
    </>
  );
};

export default WavmanPlayer;
