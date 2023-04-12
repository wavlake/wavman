import { ActionHandler } from "@/lib/shared";
import { PropsWithChildren, useState } from "react";

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

export const Button: React.FC<
  PropsWithChildren<{
    clickHandler: ActionHandler;
    className: string;
  }>
> = ({ clickHandler, children, className }) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  return (
    <button
      type="button"
      className={`${className} h-full w-full ${
        isPressed ? "-translate-x-1 translate-y-1" : ""
      }`}
      onClick={clickHandler}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 300);
      }}
    >
      {children}
    </button>
  );
};

export const DirectionalButton: React.FC<{
  direction: string;
  clickHandler: ActionHandler;
}> = ({ direction, clickHandler }) => {
  const { svgClass, buttonClass, svgSrc } = buttonInfoMap[direction];
  return (
    <Button clickHandler={clickHandler} className={buttonClass}>
      <img className={svgClass} src={svgSrc} alt={`${direction} arrow`} />
    </Button>
  );
};
