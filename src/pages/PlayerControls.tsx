import { MouseEventHandler, useState } from "react";
import { COMMENTS_VIEW, PageView } from "./shared";

type Actions = "PLAY" | "PAUSE" | "ZAP" | "SKIP" | ">" | "<";

const PlayerControls: React.FC<{
  isPlaying: boolean;
  pageView: PageView;
  playHandler: () => void
  skipHandler: () => void
  zapHandler: () => void
  toggleViewHandler: (pageView: PageView) => void
}> = ({ isPlaying, pageView, playHandler, skipHandler, zapHandler, toggleViewHandler }) => {
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const actions: Actions[] = ["PLAY", "ZAP", "SKIP", ">"];
  const actionHandlerMap: Record<Actions, MouseEventHandler<HTMLButtonElement>> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    SKIP: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(COMMENTS_VIEW),
  }

  const upHandler = () => {
  };
  const leftHandler = () => {
  };
  const downHandler = () => {
  };
  const rightHandler = () => {
  };
  const centerHandler = () => {
  };

  return (
    <div>
      {actions.map((action, index) => (
        <div
          key={action}
          className={selectedIndex === index ? 'border-2 border-amber-500' : 'bg-green-200'}
        >{action}</div>
      ))}
      <button className="bg-green-700" onClick={upHandler}>Up</button>
      <button onClick={leftHandler}>Left</button>
      <button onClick={downHandler}>Down</button>
      <button onClick={rightHandler}>Right</button>
      <button onClick={centerHandler}>Center</button>
    </div>
  );
}

export default PlayerControls;
