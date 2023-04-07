import { useNIP07Login } from "@/nostr/useNIP07Login";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

const ZapScreen: React.FC<{
}> = ({ }) => {
  const { publicKey } = useNIP07Login();
  const { register } = useFormContext();

  return (
    <div className="m-4 justify-self-center">
      {publicKey && 
        <>
          <input {...register("content")} />
          <input {...register("satAmount")} type="number" step="1" />
        </>
      }
    </div>
  );
};

export default ZapScreen;
