import { useState } from "react";
import { COMMENTS_VIEW, PageView, PLAYER_VIEW, SPLASH_VIEW, ZAP_VIEW } from "./shared";

type Actions = "PLAY" | "PAUSE" | "ZAP" | "SKIP" | ">" | "<";

type ToggleViewHandler = (pageView: PageView) => void;
type ActionHandler = () => void | ToggleViewHandler;
const PlayerControls: React.FC<{
  isPlaying: boolean;
  pageView: PageView;
  playHandler: () => void
  skipHandler: () => void
  zapHandler: () => void
  toggleViewHandler: (pageView: PageView) => void
}> = ({ isPlaying, pageView, playHandler, skipHandler, zapHandler, toggleViewHandler }) => {
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const commentViewActions: Actions[] = ["<", "PLAY", "ZAP", "SKIP"];
  const pageViewActions: Actions[] = ["PLAY", "ZAP", "SKIP", ">"];
  const zapViewActions: Actions[] = [];
  const splashViewActions: Actions[] = [];
  const actionHandlerMap: Record<Actions, ActionHandler> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    SKIP: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(PLAYER_VIEW),
  };
  const pageViewActionMap: Record<PageView, Actions[]> = {
    [PLAYER_VIEW]: pageViewActions,
    [COMMENTS_VIEW]: commentViewActions,
    [ZAP_VIEW]: zapViewActions,
    [SPLASH_VIEW]: splashViewActions,
  };
  const currentActions = pageViewActionMap[pageView];
  const centerHandler = () => actionHandlerMap[currentActions[selectedIndex]]();

  const calcMoveIndexRight = (index: number) => index + 1 >= currentActions.length ? index : index + 1;
  const calcMoveIndexLeft = (index: number) => index === 0 ? index : index - 1;

  const upHandler = () => {
    
  };
  const downHandler = () => {
  
  };

  const leftHandler = () => setSelectedIndex((selectedIndex) => calcMoveIndexLeft(selectedIndex));
  const rightHandler = () => setSelectedIndex((selectedIndex) => calcMoveIndexRight(selectedIndex));

  return (
    <div>
      {pageViewActionMap[pageView].map((action, index) => (
        <div
          key={action}
          className={selectedIndex === index ? 'border-amber-500' : ''}
        >{action}</div>
      ))}
      <button className="" onClick={upHandler}>Up</button>
      <button onClick={leftHandler}>Left</button>
      <button onClick={downHandler}>Down</button>
      <button onClick={rightHandler}>Right</button>
      <button onClick={centerHandler}>Center</button>
    </div>
  );
}

export default PlayerControls;
