import Comments from "./CommentsScreen";
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
import { FormProvider, useForm } from "react-hook-form";

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
  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();
  const shouldSkipComments = !nowPlayingTrack;
  const { allEvents: comments, loading: commentsLoading } = useEventSubscription(
    [{ ["#e"]: [nowPlayingTrack?.id || ""], limit: 20 }],
    shouldSkipComments
  );
  const [
    postComment,
    {
      data: postedComment,
      loading: postCommentLoading,
      error: postCommentError,
    },
  ] = usePublishEvent();
  const [trackIndex, setTrackIndex] = useState(0);

  const pickRandomTrack = (tracks: Event[]) => {
    setNowPlayingTrack(tracks[trackIndex]);
    setTrackIndex(trackIndex + 1);
    // setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  const zapHandler = () => {
    console.log("Zap!");
  };

  useEffect(() => {
    if (tracks?.length) pickRandomTrack(tracks);
  }, [tracks]);

  const nextHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks);
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

  return (
    <div className="flex-col">
      <Screen
        nowPlayingTrack={nowPlayingTrack}
        isPlaying={isPlaying}
        commentsLoading={commentsLoading}
        comments={comments || []}
        submitHandler={submitHandler}
      />
      <PlayerControls
        isPlaying={isPlaying}
        nextHandler={nextHandler}
        zapHandler={zapHandler}
        playHandler={playHandler}
      />
    </div>
  );
};

export default WavmanPlayer;
