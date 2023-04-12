import { ActionHandler } from "@/lib/shared";
import { PropsWithChildren, useState } from "react";

const Button: React.FC<
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

export default Button;
