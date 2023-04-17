import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const ZapAmountScreen: React.FC<{
  zapError: string;
}> = ({ zapError }) => {
  useEffect;
  const methods = useFormContext();

  return (
    <div className="mx-4 h-32 justify-self-center">
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

export default ZapAmountScreen;
