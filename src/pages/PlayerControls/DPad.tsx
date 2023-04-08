import { ActionHandler } from "../shared";
import { useState } from "react";

const buttonInfoMap: Record<
  string,
  { svgClass: string; buttonClass: string; svgSrc: string }
> = {
  up: {
    svgClass: "rotate-0",
    buttonClass: "col-start-2 col-end-2 row-start-1 row-end-1",
    svgSrc: "arrow.svg",
  },
  left: {
    svgClass: "-rotate-90",
    buttonClass: "col-start-1 col-end-1 row-start-2 row-end-2",
    svgSrc: "arrow.svg",
  },
  center: {
    svgClass: "h-12",
    buttonClass: "col-start-2 col-end-2 row-start-2 row-end-2",
    svgSrc: "center-button.svg",
  },
  right: {
    svgClass: "rotate-90",
    buttonClass: "col-start-3 col-end-3 row-start-2 row-end-2",
    svgSrc: "arrow.svg",
  },
  down: {
    svgClass: "rotate-180",
    buttonClass: "col-start-2 col-end-2 row-start-3 row-end-3",
    svgSrc: "arrow.svg",
  },
};

const DirectionalButton: React.FC<{
  direction: string;
  clickHandler: ActionHandler;
}> = ({ direction, clickHandler }) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const { svgClass, buttonClass, svgSrc } = buttonInfoMap[direction];
  return (
    <button
      className={`${buttonClass} h-full w-full ${
        isPressed ? "-translate-x-1 translate-y-1" : ""
      }`}
      onClick={clickHandler}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <img className={svgClass} src={svgSrc} alt={`${direction} arrow`} />
    </button>
  );
};

const DPad: React.FC<{
  upHandler: () => void;
  leftHandler: () => void;
  centerHandler: () => void;
  rightHandler: () => void;
  downHandler: () => void;
}> = ({ upHandler, leftHandler, centerHandler, rightHandler, downHandler }) => (
  <div className="grid h-36 w-36 grid-cols-3 grid-rows-3 items-center">
    <DirectionalButton direction="left" clickHandler={leftHandler} />
    <DirectionalButton direction="center" clickHandler={centerHandler} />
    <DirectionalButton direction="right" clickHandler={rightHandler} />
    <DirectionalButton direction="down" clickHandler={downHandler} />
    <DirectionalButton direction="up" clickHandler={upHandler} />
  </div>
);
export default DPad;
