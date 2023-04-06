import {
  ActionHandler,
  Actions,
  COMMENTS_VIEW,
  PageView,
  pageViewActionMap,
  PLAYER_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "../shared";
import { Dispatch, SetStateAction } from "react";
import DPad from "./DPad";

const PlayerControls: React.FC<{
  pageView: PageView;
  selectedActionIndex: number;
  setSelectedActionIndex: Dispatch<SetStateAction<number>>;
  playHandler: () => void;
  skipHandler: () => void;
  zapHandler: () => void;
  toggleViewHandler: (pageView: PageView) => void;
}> = ({
  pageView,
  selectedActionIndex,
  setSelectedActionIndex,
  playHandler,
  skipHandler,
  zapHandler,
  toggleViewHandler,
}) => {
  const actionHandlerMap: Record<Actions, ActionHandler> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    SKIP: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(PLAYER_VIEW),
  };

  const currentActions = pageViewActionMap[pageView];
  
  const calcMoveIndexRight = (index: number) =>
  index + 1 >= currentActions.length ? index : index + 1;
  const calcMoveIndexLeft = (index: number) =>
  index === 0 ? index : index - 1;
  
  const upHandler = () => {};
  const downHandler = () => {};
  
  const centerHandler = () =>{
    actionHandlerMap[currentActions[selectedActionIndex]]();
  };
  const leftHandler = () =>
    setSelectedActionIndex((selectedActionIndex) =>
      calcMoveIndexLeft(selectedActionIndex)
    );
  const rightHandler = () =>
    setSelectedActionIndex((selectedActionIndex) =>
      calcMoveIndexRight(selectedActionIndex)
    );

  return (
    <DPad 
      upHandler={upHandler}
      leftHandler={leftHandler}
      centerHandler={centerHandler}
      rightHandler={rightHandler}
      downHandler={downHandler}
    />
  );
};

export default PlayerControls;
