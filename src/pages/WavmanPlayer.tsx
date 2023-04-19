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
import PlayerControls from "./PlayerControls/PlayerControls";
import ReactPlayerWrapper from "./ReactPlayerWrapper";
import Screen from "./Screen/Screen";
import { WavlakeEventContent, useRelay } from "@/nostr";
import { getInvoice } from "@/nostr/zapLogic";
import { getDTagFromEvent, listEvents } from "@/nostr/zapUtils";
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

const WavmanPlayer: React.FC<{
  kind1NowPlaying?: Event;
  pickRandomTrack: () => void;
  zapReceipts: Event[];
  lastZapReceipt?: Event;
  zapReceiptsLoading: boolean;
  paymentRequest: string;
  setPaymentRequest: (paymentRequest: string) => void;
}> = ({
  kind1NowPlaying,
  pickRandomTrack,
  zapReceipts,
  lastZapReceipt,
  zapReceiptsLoading,
  paymentRequest,
  setPaymentRequest,
}) => {
  useEffect(() => {
    // runs only on startup
    if (currentPage === SPLASH_VIEW && kind1NowPlaying) {
      setCurrentPage(PLAYER_VIEW);
    }
  }, [kind1NowPlaying]);

  const skipHandler = () => {
    pickRandomTrack();
  };

  const zapHandler = async () => {
    setZapError("");
    setPageViewAndResetSelectedAction(ZAP_AMOUNT_VIEW);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };

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

  const [kind32123Events, setKind32123Events] = useState<Event[]>([]);

  const { relay } = useRelay();
  useEffect(() => {
    const kind32123Filter = [
      {
        kinds: [32123],
        ["#d"]: [getDTagFromEvent(kind1NowPlaying)],
        limit: 4,
      },
    ];
    if (relay && kind1NowPlaying) {
      listEvents(relay, kind32123Filter).then((events) => {
        events && setKind32123Events(events);
      });
    }
  }, [kind1NowPlaying, relay]);

  const [kind32123NowPlaying] = kind32123Events || [];
  const defaultTrackInfo: Partial<WavlakeEventContent> = {
    title: "",
    enclosure: "",
    creator: "",
    link: "",
  }
  const trackContent: WavlakeEventContent = JSON.parse(
    kind32123NowPlaying?.content || JSON.stringify(defaultTrackInfo)
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
