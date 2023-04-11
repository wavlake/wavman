import { WebLNProvider as WebLNProviderType } from "@webbtc/webln-types";
import {
  useContext,
  createContext,
  useState,
  PropsWithChildren,
  useEffect,
} from "react";

const WebLNContext = createContext<Partial<WebLNProviderType> | undefined>({});

export const useWebLN = () => {
  const context = useContext(WebLNContext);

  if (context === undefined) {
    throw new Error("useWebLN was used outside of its Provider");
  }

  return context;
};

export const WebLNProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const webLN = {
    enable: async () => {
      const { enabled, remember } = (await window?.webln?.enable()) || {};
      return { enabled, remember };
    },
    sendPayment: async (paymentRequest: string) => {
      const { preimage } =
        (await window?.webln?.sendPayment(paymentRequest)) || {};
      return { preimage };
    },
  };

  webLN.enable();
  return (
    <WebLNContext.Provider value={webLN as WebLNProviderType}>
      {children}
    </WebLNContext.Provider>
  );
};
