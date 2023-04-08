import Logo from "./Logo";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screen from "./Screen/Screen";
import {
  Actions,
  OFF_VIEW,
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
} from "./shared";
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

const signComment = (content: string, parentTrack: Event): Event => {
  // replace with user PK
  const sk = generatePrivateKey();
  const pk = getPublicKey(sk);
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
    Array.from(randomSHA256String(4))
  );

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();

  // Get a batch of tracks
  const { data: tracks, loading: tracksLoading } = useListEvents([
    { kinds: [32123], ["#f"]: randomChar },
  ]);

  // Post a comment mutation
  const [
    postComment,
    {
      data: postedComment,
      loading: postCommentLoading,
      error: postCommentError,
    },
  ] = usePublishEvent();
  const [trackIndex, setTrackIndex] = useState(0);

  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();

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
  const turnOnPlayer = () => setPageView(PLAYER_VIEW);
  const turnOffPlayer = () => setPageView(OFF_VIEW);

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
  const zapHandler = () => {
    console.log("Implement some zaps!");
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  interface Form {
    comment: string;
  }

  const submitHandler = ({ comment }: Form) => {
    if (nowPlayingTrack) {
      const signedEvent = signComment(comment, nowPlayingTrack);
      postComment(signedEvent);
    }
  };

  ///////// NAVIGATION /////////
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [pageView, setPageView] = useState<PageView>(SPLASH_VIEW);
  const toggleViewHandler = (pageView: PageView) => {
    resetSelectionOnPageChange(pageView, setSelectedActionIndex);
    setPageView(pageView);
  };

  return (
    // Page Container
    <div className="mx-auto mt-4 h-screen md:mt-12">
      <div className="h-128 relative mx-auto grid max-w-sm border-8 border-black bg-wavgray">
        {/* Screen Container */}
        <div className="relative my-4 mx-4 border-8 border-black p-2">
          <Screen
            nowPlayingTrack={nowPlayingTrack}
            isPlaying={isPlaying}
            commentsLoading={commentsLoading}
            comments={comments || []}
            submitHandler={submitHandler}
            pageView={pageView}
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
  );
};

export default WavmanPlayer;
