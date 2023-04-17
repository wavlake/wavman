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
import Button from "./PlayerControls/Button";
import PlayerControls from "./PlayerControls/PlayerControls";
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
const trackPubKey = process.env.NEXT_PUBLIC_TRACK_EVENT_PUBKEY || "";

const randomSHA256String = (length: number) => {
  const alphanumericString = Array.from(Array(length + 30), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
  const SHA256Regex = /[^A-Fa-f0-9-]/g;
  const filteredChars = alphanumericString.replace(SHA256Regex, "").slice(0, length);
  return new Set(filteredChars);
};

const WavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChars, setRandomChars] = useState<string[]>(
    Array.from(randomSHA256String(randomTrackFeatureFlag ? 4 : 200))
  );

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();

  // this should be switched to querying for a tags, but a tag values are different for each track
  // add a new tag to the track to make it easier to query for?
  // Get a batch of kind 1 events
  const { allEvents: kind1Tracks, loading: tracksLoading } = useEventSubscription([
    {
      kinds: [1],
      ["#f"]: randomChars,
      ["#p"]: [trackPubKey],
      limit: 40,
    },
  ]);

  // Post a comment mutation (not used at the moment)
  const [
    publishEvent,
    {
      data: postedComment,
      loading: publishEventLoading,
      error: publishEventError,
    },
  ] = usePublishEvent();
  const [trackIndex, setTrackIndex] = useState(0);

  const [kind1NowPlaying, setKind1NowPlaying] = useState<Event>();

  // 32123 event listener
  const [tagName, kind1ATag] =
    kind1NowPlaying?.tags?.find(([tagType]) => tagType === "a") || [];
  const kind32123DTag = kind1ATag?.replace("32123:", "")?.split(":")?.[1];
  const skipKind32123 = !kind32123DTag;

  if (skipKind32123) console.error("D tag not found for the current track:", kind1NowPlaying);
  // get the kind 1's replaceable 32123 event
  // TODO implement replaceability and test to make sure the most recent is consumed here
  const { allEvents: kind32123NowPlaying, loading: kind32123NowPlayingLoading } =
    useEventSubscription(
      [
        {
          kinds: [32123],
          ["#d"]: [kind32123DTag],
          limit: 4,
        },
      ],
      skipKind32123
    );

  const [paymentRequest, setpaymentRequest] = useState("");

  // ZapReceipt Listener (aka zap comments)
  const skipZapReceipts = !kind1NowPlaying?.id;
  const {
    allEvents: zapReceipts,
    lastEvent: lastZapReceipt,
    loading: zapReceiptsLoading,
  } = useEventSubscription(
    [{ kinds: [9735], ["#e"]: [kind1NowPlaying?.id || ""] }],
    skipZapReceipts
  );

  // Get track comments, skip till a track is ready
  // kind1 comments are currently not used
  // const skipComments = !kind1NowPlaying;
  // const { allEvents: comments, loading: commentsLoading } =
  //   useEventSubscription(
  //     [{ ["#e"]: [kind1NowPlaying?.id || ""], limit: 20 }],
  //     skipComments
  //   );

  ///////// UI /////////
  const pickRandomTrack = (kind1Tracks: Event[]) => {
    setKind1NowPlaying(kind1Tracks[trackIndex]);
    if (randomTrackFeatureFlag) {
      setKind1NowPlaying(
        kind1Tracks[Math.floor(Math.random() * kind1Tracks.length)]
      );
    } else {
      setTrackIndex(trackIndex + 1);
    }
  };
  const turnOnPlayer = () => {
    setCurrentPage(PLAYER_VIEW);
  };

  // The player currently auto turns on when tracks are loaded
  // Tracks load automatically when the page loads
  useEffect(() => {
    if (kind1Tracks?.length && !tracksLoading) {
      pickRandomTrack(kind1Tracks);
      turnOnPlayer();
    }
  }, [kind1Tracks, tracksLoading]);

  const skipHandler = () => {
    if (kind1Tracks?.length) pickRandomTrack(kind1Tracks);
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
    setpaymentRequest("");
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
      setpaymentRequest(invoice);
      const { enabled } = (await window.webln?.enable()) || {};
      // use webLN to pay
      if (enabled) {
        try {
          await window.webln?.sendPayment(invoice);
        } catch (e) {
          console.log("Error paying via webln:", e);
        }
      }
    }
  };

  useEffect(() => {
    const [bolt11, lastPaymentRequest] =
      lastZapReceipt?.tags.find(([tagName]) => tagName === "bolt11") || [];
    // If user is on the QR_VIEW and a zap receipt is received for the current payment request
    if (currentPage === QR_VIEW && paymentRequest === lastPaymentRequest) {
      setPageViewAndResetSelectedAction(COMMENTS_VIEW);
    }
  }, [lastZapReceipt, paymentRequest]);

  const [nowPlayingTrackContent] = kind32123NowPlaying || [];
  return (
    // Page Container
    <>
      <FormProvider {...methods}>
        <form>
          <div className="relative mx-auto mt-4 grid h-[34rem] w-[22rem] justify-center border-8 border-black bg-wavgray">
            <Screen
              zapError={zapError}
              nowPlayingTrackContent={nowPlayingTrackContent}
              isPlaying={isPlaying}
              commentsLoading={zapReceiptsLoading}
              comments={zapReceipts || []}
              currentPage={currentPage}
              paymentRequest={paymentRequest}
              selectedActionIndex={selectedActionIndex}
              commenterPubKey={commenterPubKey}
              skipHandler={skipHandler}
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
      <Button
        className="mx-auto mt-4 w-28 self-start bg-wavgray hover:tracking-wider"
        clickHandler={setUserPubKey}
      >
        NIP-07 LOGIN
      </Button>
      <div className="mx-auto mt-8 flex">
        <Links />
      </div>
    </>
  );
};

export default WavmanPlayer;
