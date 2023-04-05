import { Dispatch, SetStateAction } from "react";
import { Actions, COMMENTS_VIEW, PageView, pageViewActionMap, PLAYER_VIEW, SPLASH_VIEW, ZAP_VIEW } from "./shared";

type ToggleViewHandler = (pageView: PageView) => void;
type ActionHandler = () => void | ToggleViewHandler;
const PlayerControls: React.FC<{
  isPlaying: boolean;
  pageView: PageView;
  selectedActionIndex: number;
  setSelectedActionIndex: Dispatch<SetStateAction<number>>;
  playHandler: () => void
  skipHandler: () => void
  zapHandler: () => void
  toggleViewHandler: (pageView: PageView) => void
}> = ({ isPlaying, pageView, selectedActionIndex, setSelectedActionIndex, playHandler, skipHandler, zapHandler, toggleViewHandler }) => {
  const actionHandlerMap: Record<Actions, ActionHandler> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    SKIP: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(PLAYER_VIEW),
  };

  const currentActions = pageViewActionMap[pageView];
  const centerHandler = () => actionHandlerMap[currentActions[selectedActionIndex]]();

  const calcMoveIndexRight = (index: number) => index + 1 >= currentActions.length ? index : index + 1;
  const calcMoveIndexLeft = (index: number) => index === 0 ? index : index - 1;

  const upHandler = () => {
    
  };
  const downHandler = () => {
  
  };

  const leftHandler = () => setSelectedActionIndex((selectedActionIndex) => calcMoveIndexLeft(selectedActionIndex));
  const rightHandler = () => setSelectedActionIndex((selectedActionIndex) => calcMoveIndexRight(selectedActionIndex));

  return (
    <div className="w-48 h-48">
      {pageViewActionMap[pageView].map((action, index) => (
        <div
          key={action}
          className={selectedActionIndex === index ? 'border-2 border-teal-500' : ''}
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
