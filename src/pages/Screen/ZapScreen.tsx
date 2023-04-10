import { useNIP07Login } from "@/nostr/useNIP07Login";
import { useFormContext } from "react-hook-form";

const ZapScreen: React.FC<{
  zapError: string;
}> = ({ zapError }) => {
  const { publicKey } = useNIP07Login();
  const methods = useFormContext();

  return (
    <div className="m-4 justify-self-center">
      {publicKey && "Comment"}
      {publicKey && (
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
