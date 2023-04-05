import PlayerControls from "./PlayerControls";
import Screen from "./Screen";
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
import { Actions, PageView, PLAYER_VIEW, SPLASH_VIEW } from "./shared";
import Logo from "./Logo";

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

  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();

  const { data: tracks, loading: tracksLoading } = useListEvents([
    { kinds: [32123], ["#f"]: randomChar },
  ]);
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
  const shouldSkipComments = !nowPlayingTrack;
  const { allEvents: comments, loading: commentsLoading } = useEventSubscription(
    [{ ["#e"]: [nowPlayingTrack?.id || ""], limit: 20 }],
    shouldSkipComments
  );
  
  const pickRandomTrack = (tracks: Event[]) => {
    setNowPlayingTrack(tracks[trackIndex]);
    setTrackIndex(trackIndex + 1);
    // setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };
  useEffect(() => {
    if (tracks?.length) pickRandomTrack(tracks);
  }, [tracks]);
  const skipHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks);
  };
  const zapHandler = () => {
    console.log("Zap!");
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  const [pageView, setPageView] = useState<PageView>(PLAYER_VIEW);
  const toggleViewHandler = (pageView: PageView) => {
    setPageView(pageView);
  }
  interface Form {
    comment: string;
  }

  const submitHandler = ({ comment }: Form) => {
    if (nowPlayingTrack) {
      const signedEvent = signComment(comment, nowPlayingTrack);
      postComment(signedEvent);
    }
  };

  const [selectedActionIndex, setSelectedActionIndex] = useState(0);

  return (
    <div className="w-[90vw] h-[90vh] bg-slate-100 place-self-center align-middle grid place-items-center">
      <Screen
        nowPlayingTrack={nowPlayingTrack}
        isPlaying={isPlaying}
        commentsLoading={commentsLoading}
        comments={comments || []}
        submitHandler={submitHandler}
        pageView={pageView}
        selectedActionIndex={selectedActionIndex}
      />
      <Logo />
      <PlayerControls
        isPlaying={isPlaying}
        pageView={pageView}
        selectedActionIndex={selectedActionIndex}
        setSelectedActionIndex={setSelectedActionIndex}
        skipHandler={skipHandler}
        zapHandler={zapHandler}
        playHandler={playHandler}
        toggleViewHandler={toggleViewHandler}
      />
    </div>
  );
};

export default WavmanPlayer;
