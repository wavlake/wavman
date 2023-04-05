import { WavlakeEventContent } from "@/nostr/interfaces";
import { Event } from "nostr-tools";
import { MouseEventHandler, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const NowPlaying: React.FC<{
  title: string;
  artist: string;
}> = ({ title, artist }) => (
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
}> = ({ isPlaying, playHandler, nextHandler, zapHandler }) => (
  <div>
    <button onClick={playHandler}>{isPlaying ? "Pause" : "Play"}</button>
    <button onClick={nextHandler}>Next</button>
    <button onClick={zapHandler}>Zap</button>
  </div>
);

const Player: React.FC<{
  loading: boolean;
  nextHandler: () => void;
  nowPlayingTrack?: Event;
}> = ({ loading, nextHandler, nowPlayingTrack }) => {
  const [hasWindow, setHasWindow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window != "undefined") {
      setHasWindow(true);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!nowPlayingTrack) return <div>No track...</div>;

  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };

  const zapHandler = () => {
    console.log("Zap!");
  };

  const trackContent: WavlakeEventContent = JSON.parse(nowPlayingTrack.content);

  return (
    <div className="flex-col">
      <NowPlaying title={trackContent.title} artist={trackContent.creator} />
      <PlayerControls
        isPlaying={isPlaying}
        playHandler={playHandler}
        nextHandler={nextHandler}
        zapHandler={zapHandler}
      />
      {hasWindow && (
        <ReactPlayer
          controls={false}
          url={trackContent.enclosure}
          playing={isPlaying}
          height="0"
          width="0"
        />
      )}
    </div>
  );
};

export default Player;
