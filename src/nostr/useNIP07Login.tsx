import {
  useContext,
  createContext,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";
import { Event, UnsignedEvent } from "nostr-tools";

type SignEvent = (event: UnsignedEvent) => Promise<Event | undefined>;
interface NIP07 {
  getPublicKey: () => Promise<string>;
  signEvent: SignEvent;
}

interface NIP07Window extends Window {
  nostr?: NIP07;
}

const getNIP07Methods = async () => {
  const NIP07Window = window as NIP07Window;
  const { nostr } = NIP07Window;

  if (!nostr) {
    console.log("NIP-07 extension not found");
    return;
  }
  return nostr;
};

export const useNIP07Login = () => {
  const context = useContext(NIP07Context);

  if (context === undefined) {
    throw new Error("useNIP07Login was used outside of its Provider");
  }

  return context;
};

export type NIP07ContextType = Partial<Omit<NIP07, "getPublicKey">> & {
  publicKey?: string;
};
export const NIP07Context = createContext<NIP07ContextType>({
  publicKey: undefined,
  signEvent: undefined,
});

export const NIP07Provider: React.FC<PropsWithChildren> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string>();
  const signEvent: SignEvent = async (event) => {
    return (window as NIP07Window)?.nostr?.signEvent(event);
  };

  useEffect(() => {
    getNIP07Methods()
      .then(async (nostr) => {
        if (!nostr) return;
        const pk = await nostr.getPublicKey();
        setPublicKey(pk);
      })
      .catch((e) => console.log(`${e}`));
  }, []);

  return (
    <NIP07Context.Provider
      value={{
        publicKey,
        signEvent,
      }}
    >
      {children}
    </NIP07Context.Provider>
  );
};
