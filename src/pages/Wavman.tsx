import Comments from "./Comments";
import Player from "./Player";
import { useGetTracks, useCommentSubscription, usePostComment } from "@/nostr";
import {
  Event,
  getPublicKey,
  generatePrivateKey,
  getEventHash,
  signEvent,
  UnsignedEvent,
} from "nostr-tools";
import { useEffect, useState } from "react";

const Wavman: React.FC<{}> = ({}) => {
  const { data: tracks, loading: tracksLoading } = useGetTracks([
    { kinds: [32123], limit: 10 },
  ]);
  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();
  const shouldSkipComments = !nowPlayingTrack;
  const { allEvents: comments, loading: commentsLoading } =
    useCommentSubscription(
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
  ] = usePostComment();
  const [trackIndex, setTrackIndex] = useState(0);
  console.log({ comments, commentsLoading, tracksLoading, postCommentLoading });
  const pickRandomTrack = (tracks: Event[]) => {
    setNowPlayingTrack(tracks[trackIndex]);
    setTrackIndex(trackIndex + 1);
    // setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };

  useEffect(() => {
    if (tracks?.length) pickRandomTrack(tracks);
  }, [tracks]);

  const nextHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks);
  };
  const submitCommentHandler = (content: string) => {
    if (nowPlayingTrack) {
      let sk = generatePrivateKey();
      let pk = getPublicKey(sk);
      let unsignedEvent: UnsignedEvent = {
        kind: 1,
        pubkey: pk,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", nowPlayingTrack.id, "wss://relay.wavlake.com/", "reply"]],
        content,
      };
      const signedEvent: Event = {
        ...unsignedEvent,
        id: getEventHash(unsignedEvent),
        sig: signEvent(unsignedEvent, sk),
      };

      postComment(signedEvent);
    }
  };
  return (
    <div className="flex-col">
      <Player
        loading={tracksLoading}
        nowPlayingTrack={nowPlayingTrack}
        nextHandler={nextHandler}
      />
      <Comments
        loading={commentsLoading}
        comments={comments || []}
        submitCommentHandler={submitCommentHandler}
      />
    </div>
  );
};

export default Wavman;
