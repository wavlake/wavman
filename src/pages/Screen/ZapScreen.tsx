import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const ZapScreen: React.FC<{
  zapError: string;
  commenterPubKey?: string;
}> = ({ zapError, commenterPubKey }) => {
  useEffect;
  const methods = useFormContext();

  return (
    <div className="m-4 justify-self-center">
      {commenterPubKey && "Comment"}
      {commenterPubKey && (
        <input {...methods?.register("content")} className="w-full" required />
      )}
      Zap Amount
      <input
        {...methods?.register("satAmount")}
        type="number"
        step="10"
        className="w-full"
      />
      {zapError}
    </div>
  );
};

export default ZapScreen;
