import { MouseEventHandler } from "react";

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

export default PlayerControls;