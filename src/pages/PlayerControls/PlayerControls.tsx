import {
  ActionHandler,
  Actions,
  COMMENTS_VIEW,
  PageView,
  pageViewActionMap,
  PLAYER_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "../../lib/shared";
import DPad from "./DPad";
import { Dispatch, SetStateAction } from "react";

const PlayerControls: React.FC<{
  pageView: PageView;
  selectedActionIndex: number;
  setSelectedActionIndex: Dispatch<SetStateAction<number>>;
  playHandler: () => void;
  skipHandler: () => void;
  zapHandler: () => void;
  confirmZap: () => void;
  toggleViewHandler: (pageView: PageView) => void;
}> = ({
  pageView,
  selectedActionIndex,
  setSelectedActionIndex,
  playHandler,
  skipHandler,
  zapHandler,
  toggleViewHandler,
  confirmZap,
}) => {
  const actionHandlerMap: Record<Actions, ActionHandler> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    NEXT: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(PLAYER_VIEW),
    CONFIRM: confirmZap,
    COMMENTS: () => toggleViewHandler(COMMENTS_VIEW),
    // ON: () => toggleViewHandler(PLAYER_VIEW),
    // OFF: () => toggleViewHandler(OFF_VIEW),
  };

  const currentActions = pageViewActionMap[pageView];

  const calcMoveIndexRight = (index: number) =>
    index + 1 >= currentActions.length ? index : index + 1;
  const calcMoveIndexLeft = (index: number) =>
    index === 0 ? index : index - 1;

  const upHandler = () => {};
  const downHandler = () => {};

  const centerHandler = () => {
    actionHandlerMap[currentActions[selectedActionIndex]]?.();
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
    <div className="relative mx-auto my-4 w-40 border-8 border-black p-0">
      <DPad
        upHandler={upHandler}
        leftHandler={leftHandler}
        centerHandler={centerHandler}
        rightHandler={rightHandler}
        downHandler={downHandler}
      />
      {/* Controls Border Cutouts */}
      <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-wavgray"></div>
    </div>
  );
};

export default PlayerControls;
