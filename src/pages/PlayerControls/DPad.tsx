import DirectionalButton from "./DirectionalButton";

const DPad: React.FC<{
  upHandler: () => void;
  leftHandler: () => void;
  centerHandler: () => void;
  rightHandler: () => void;
  downHandler: () => void;
}> = ({ upHandler, leftHandler, centerHandler, rightHandler, downHandler }) => (
  <div className="grid h-36 w-36 grid-cols-3 grid-rows-3 items-center gap-4">
    <DirectionalButton direction="left" clickHandler={leftHandler} />
    <DirectionalButton direction="center" clickHandler={centerHandler} />
    <DirectionalButton direction="right" clickHandler={rightHandler} />
    <DirectionalButton direction="down" clickHandler={downHandler} />
    <DirectionalButton direction="up" clickHandler={upHandler} />
  </div>
);
export default DPad;
