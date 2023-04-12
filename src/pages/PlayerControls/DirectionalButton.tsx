import { ActionHandler } from "@/lib/shared";
import Button from "./Button";
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

const DirectionalButton: React.FC<{
  direction: string;
  clickHandler: ActionHandler;
  centerButtonPressedState?: ReturnType<typeof useState<boolean>>;
}> = ({ direction, clickHandler, centerButtonPressedState }) => {
  const { svgClass, buttonClass, svgSrc } = buttonInfoMap[direction] || {};
  return (
    <Button buttonState={centerButtonPressedState} clickHandler={clickHandler} className={buttonClass}>
      <img className={svgClass} src={svgSrc} alt={`${direction} arrow`} />
    </Button>
  );
};

export default DirectionalButton;
