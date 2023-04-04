import { SignedEventKind32123, WavlakeEventContent } from "@/nostr/interfaces";
import { useListEvents } from "@/nostr/useListEvents";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

const NowPlaying: React.FC<{
  title: string;
  artist: string;
}> = ({
  title,
  artist,
}) => (
  <div className="grid grid-cols-1">
    <div className="col-span-1">{artist}</div>
    <div className="col-span-1">{title}</div>
  </div>
);

const PlayerControls: React.FC<{
  isPlaying: boolean;
  playHandler: MouseEventHandler<HTMLButtonElement>;
  nextHandler: MouseEventHandler<HTMLButtonElement>;
  zapHandler: MouseEventHandler<HTMLButtonElement>;
}> = ({
  isPlaying,
  playHandler,
  nextHandler,
  zapHandler
}) => (
  <div>
    <button onClick={playHandler}>{isPlaying ? "Pause" : "Play"}</button>
    <button onClick={nextHandler}>Next</button>
    <button onClick={zapHandler}>Zap</button>
  </div>
);


const Player: React.FC<{}> = ({}) => {
  const { loading, tracks } = useListEvents([{ kinds: [32123] }]);

  const [hasWindow, setHasWindow] = useState(false);
  const [nowPlayingTrack, setNowPlayingTrack] = useState<SignedEventKind32123>();

  const pickRandomTrack = (tracks: SignedEventKind32123[]) => setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  
  useEffect(() => {
    if (typeof window != "undefined") {
      setHasWindow(true);
    }
    if (tracks.length) {
      pickRandomTrack(tracks);
    }
  }, [tracks]);

  const [isPlaying, setIsPlaying] = useState(false);

  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  const nextHandler = () => {
    pickRandomTrack(tracks)
  };

  const zapHandler = () => {
    console.log('Zap!')
  }

  if (loading) return (<div>Loading...</div>);
  if (!nowPlayingTrack) return (<div>no track...</div>);
  const trackContent: WavlakeEventContent = JSON.parse(nowPlayingTrack?.content) 
  console.log({trackContent})
  return (
    <div className="flex-col">
      <NowPlaying title={trackContent.title} artist={trackContent.creator} />
      <PlayerControls
        isPlaying={isPlaying}
        playHandler={playHandler}
        nextHandler={nextHandler}
        zapHandler={zapHandler}
      />
      {hasWindow && <ReactPlayer
        controls={false}
        url={trackContent.enclosure}
        playing={isPlaying}
        height="0"
        width="0"
      />}
    </div>
  )
}

export default Player;