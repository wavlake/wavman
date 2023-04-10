import { useContext, createContext, useState, PropsWithChildren, useEffect } from "react";
import { WebLNProvider as WebLNProviderType } from "@webbtc/webln-types";

const WebLNContext = createContext<Partial<WebLNProviderType> & { isEnabled: boolean; }>({ isEnabled: false });

const getWebLN = async () => {
  const { webln } = window;

  if (!webln) {
    console.warn("WebLN not enabled");
    return;
  }
  return webln;
};

export const useWebLN = () => {
  const context = useContext(WebLNContext);

  if (context === undefined) {
    throw new Error("useWebLN was used outside of its Provider");
  };

  return context;
};

export const WebLNProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [webLN, setWebLN] = useState<WebLNProviderType>();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  useEffect(() => {
    getWebLN()
      .then(async (webLN) => {
        if (!webLN) return;
        const { enabled } = await webLN.enable();
        setIsEnabled(enabled);
        enabled && setWebLN(webLN);
      })
      .catch((e) => console.log(`${e}`));
  }, []);

  return (
    <WebLNContext.Provider
      value={{
        isEnabled,
        ...webLN,
      }}
    >
      {children}
    </WebLNContext.Provider>
  );
};