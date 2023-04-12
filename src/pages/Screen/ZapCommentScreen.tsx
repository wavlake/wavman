import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const ZapCommentScreen: React.FC<{
}> = ({ }) => {
  useEffect;
  const methods = useFormContext();

  return (
    <div className="m-4 justify-self-center">
      Comment
      <input
        {...methods?.register("content")}
        className="w-full"
      />
    </div>
  );
};

export default ZapCommentScreen;
