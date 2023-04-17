import { ActionHandler } from "@/lib/shared";
import { PropsWithChildren, useState } from "react";

const Button: React.FC<
  PropsWithChildren<{
    clickHandler: ActionHandler;
    className: string;
    buttonState?: ReturnType<typeof useState<boolean>>;
  }>
> = ({ clickHandler, children, className, buttonState }) => {
  const [isPressedFallback, setIsPressedFallback] = useState(false);
  const [isPressed, setIsPressed] = buttonState || [];
  return (
    <button
      type="button"
      className={`${className} h-full w-full ${
        isPressed || isPressedFallback ? "-translate-x-0.5 translate-y-0.5" : ""
      }`}
      onClick={clickHandler}
      onMouseDown={() => {
        setIsPressed?.(true);
        setIsPressedFallback(true);
      }}
      onMouseUp={() => {
        setIsPressed?.(false);
        setIsPressedFallback(false);
      }}
      onMouseLeave={() => {
        setIsPressed?.(false);
        setIsPressedFallback(false);
      }}
      onTouchStart={() => {
        setIsPressed?.(true);
        setTimeout(() => setIsPressed?.(false), 300);
        setIsPressedFallback(true);
        setTimeout(() => setIsPressedFallback(false), 300);
      }}
    >
      {children}
    </button>
  );
};

export default Button;
