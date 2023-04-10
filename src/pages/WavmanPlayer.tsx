import { FormProvider, useForm } from "react-hook-form";
import {
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
  QR_VIEW,
  ZAP_VIEW,
} from "../lib/shared";
import Logo from "./Logo";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screen from "./Screen/Screen";
import { useRelay } from "@/nostr";
import {
  Event,
  getPublicKey,
  generatePrivateKey,
  getEventHash,
  signEvent,
  UnsignedEvent,
} from "nostr-tools";
import { useEffect, useState } from "react";
import { getInvoice } from "@/nostr/zapLogic";
import { useNIP07Login } from "@/nostr/useNIP07Login";

export interface Form {
  content: string;
  satAmount: number;
}

const signComment = (content: string, parentTrack: Event): Event => {
  const unsignedEvent: UnsignedEvent = {
    kind: 1,
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["e", parentTrack.id, "wss://relay.wavlake.com/", "reply"]],
    content,
  };

  return {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: signEvent(unsignedEvent, sk),
  };
};



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
    setPageView(PLAYER_VIEW);
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
    setPageViewAndResetSelectedAction(ZAP_VIEW);
  };
  
  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  
  
  ///////// NAVIGATION /////////
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [pageView, setPageView] = useState<PageView>(SPLASH_VIEW);
  const setPageViewAndResetSelectedAction = (pageView: PageView) => {
    resetSelectionOnPageChange(pageView, setSelectedActionIndex);
    setPageView(pageView);
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
    if (!satAmount && !content) {
      setZapError("Please enter either a comment or an amount");
      return false;
    } else {
      setZapError("");
      return true;
    };
  };
  const nip07 = useNIP07Login();
  const confirmZap = async () => {
    if (!nowPlayingTrack) {
      console.log('No track is playing');
      return;
    }
    if (!isFormValid()) return;
    const invoice = await getInvoice({
      nowPlayingTrack,
      satAmount,
      content,
      nip07
     });
    if (!invoice) {
      console.log('Error retrieving invoice');
      setPageViewAndResetSelectedAction(ZAP_VIEW);
      return;
    }
    setPageViewAndResetSelectedAction(QR_VIEW);
    setpaymentRequest(invoice);
  };

  return (
    // Page Container
    <FormProvider {...methods}>
      <form onSubmit={() => console.log('form submit')}>
        <div className="mx-auto mt-4 h-screen md:mt-12">
          <div className="h-128 relative mx-auto grid max-w-sm border-8 border-black bg-wavgray">
            {/* Screen Container */}
            <div className="relative my-4 mx-4 border-8 border-black p-2">
              <Screen
                zapError={zapError}
                nowPlayingTrack={nowPlayingTrack}
                isPlaying={isPlaying}
                commentsLoading={commentsLoading}
                comments={comments || []}
                // submitHandler={submitHandler}
                pageView={pageView}
                paymentRequest={paymentRequest}
                selectedActionIndex={selectedActionIndex}
              />
              {/* Screen Border Top Cutouts */}
              <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -left-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -right-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
            </div>

            <Logo />

            {/* Controls Container */}
            <div className="relative mx-auto my-4 border-8 border-black p-0">
              <PlayerControls
                pageView={pageView}
                selectedActionIndex={selectedActionIndex}
                setSelectedActionIndex={setSelectedActionIndex}
                skipHandler={skipHandler}
                zapHandler={zapHandler}
                playHandler={playHandler}
                toggleViewHandler={toggleViewHandler}
                confirmZap={confirmZap}
              />
              {/* Controls Border Cutouts */}
              <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -left-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
              <div className="absolute -right-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
            </div>

            {/* Player Border Lines & Cutouts */}
            <div className="absolute left-0 top-0 h-4 w-2 bg-black"></div>
            <div className="absolute right-0 top-0 h-4 w-2 bg-black"></div>
            <div className="absolute left-0 bottom-0 h-4 w-2 bg-black"></div>
            <div className="absolute right-0 bottom-0 h-4 w-2 bg-black"></div>
            <div className="absolute -left-2 -top-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -right-2 -top-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -left-2 -bottom-2 h-6 w-2 bg-wavpink"></div>
            <div className="absolute -right-2 -bottom-2 h-6 w-2 bg-wavpink"></div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default WavmanPlayer;
