import { useListEvents } from "@/nostr/useListEvents";
import { Event } from "nostr-tools";
import { useEffect, useState } from "react";
import Comments from "./Comments";
import Player from "./Player";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>
    {comment.content}
  </div>
)

const Wavman: React.FC<{}> = ({}) => {
  const { data: tracks, loading: tracksLoading } = useListEvents([{ kinds: [32123] }]);
  const { data: comments, loading: commentsLoading } = useListEvents([{ kinds: [32123] }]);

  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();
  const pickRandomTrack = (tracks: Event[]) => setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  
  useEffect(() => {
    if (tracks?.length) pickRandomTrack(tracks);
  }, [tracks]);

  const nextHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks)
  };

  console.log({nowPlayingTrack})

  return (
    <div className="flex-col">
      <Player loading={tracksLoading} nowPlayingTrack={nowPlayingTrack} nextHandler={nextHandler} />
      <Comments loading={commentsLoading} comments={comments} />
    </div>
  )
}

export default Wavman;