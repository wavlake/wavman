import { useNIP07Login } from "@/nostr/useNIP07Login";
import { useFormContext } from "react-hook-form";

const ZapScreen: React.FC<{
  zapError: string;
}> = ({ zapError }) => {
  const { publicKey } = useNIP07Login();
  const { register  } = useFormContext();

  return (
    <div className="m-4 justify-self-center">
      Comment
      {publicKey && <input {...register("content")} className="w-[17rem]" required/>}
      Zap Amount
      <input {...register("satAmount")} type="number" step="10" className="w-[17rem]" />
      {zapError}
    </div>
  );
};

export default ZapScreen;
