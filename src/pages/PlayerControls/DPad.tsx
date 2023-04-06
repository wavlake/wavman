import { ActionHandler } from "../shared";

const buttonInfoMap: Record<string, { svgClass: string; buttonClass: string; svgSrc: string; }> = {
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
    svgClass: "",
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

const DirectionalButton: React.FC<{ direction: string; clickHandler: ActionHandler }> =
({ direction, clickHandler }) => {
  const {
    svgClass,
    buttonClass,
    svgSrc,
  } = buttonInfoMap[direction];
  return (
    <button className={`${buttonClass} w-full h-full`} onClick={clickHandler}>
      <img className={svgClass} src={svgSrc} alt={`${direction} arrow`}/>
    </button>
  );
};

const DPad: React.FC<{
  upHandler: () => void;
  leftHandler: () => void;
  centerHandler: () => void;
  rightHandler: () => void;
  downHandler: () => void;
}> = ({
  upHandler,
  leftHandler,
  centerHandler,
  rightHandler,
  downHandler,
}) => (
  <div className="h-52 w-52 grid grid-cols-3 grid-rows-3 place-items-center">
    <DirectionalButton direction="left" clickHandler={leftHandler} />
    <DirectionalButton direction="center" clickHandler={centerHandler} />
    <DirectionalButton direction="right" clickHandler={rightHandler} />
    <DirectionalButton direction="down" clickHandler={downHandler} />
    <DirectionalButton direction="up" clickHandler={upHandler} />
  </div>
);
export default DPad;
