import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const ZapCommentScreen: React.FC<{}> = ({}) => {
  useEffect;
  const methods = useFormContext();

  return (
    <div className="mx-4 h-32 justify-self-center">
      Comment
      <input {...methods?.register("content")} className="w-full" />
    </div>
  );
};

export default ZapCommentScreen;
