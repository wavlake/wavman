import { Event, UnsignedEvent } from "nostr-tools";
import { useContext, createContext, PropsWithChildren, useState } from "react";

declare global {
  interface Window {
    nostr?: NIP07;
  }
}

export type Nip07SignEvent = (
  event: UnsignedEvent
) => Promise<Event | undefined>;
export interface NIP07 {
  getPublicKey: () => Promise<string | undefined>;
  signEvent: Nip07SignEvent;
}

export const useNIP07Login = () => {
  const context = useContext(NIP07Context);

  if (context === undefined) {
    throw new Error("useNIP07Login was used outside of its Provider");
  }

  return context;
};

export const NIP07Context = createContext<Partial<NIP07>>({
  getPublicKey: undefined,
  signEvent: undefined,
});

export const NIP07Provider: React.FC<PropsWithChildren> = ({ children }) => {
  const [pubKey, setPubKey] = useState<string | undefined>();
  const nip07: NIP07 = {
    signEvent: async (event) => {
      const signedEvent = await window?.nostr?.signEvent(event);
      return signedEvent;
    },
    getPublicKey: async (): Promise<string | undefined> => {
      if (pubKey) return pubKey;
      const pk = await window?.nostr
        ?.getPublicKey()
        .then((pk) => {
          setPubKey(pk);
          return pk;
        })
        .catch((err) => {
          console.log("Error getting pubkey from NIP07", err);
          return undefined;
        });
      return pk || undefined;
    },
  };
  setTimeout(() => nip07.getPublicKey(), 100);
  return (
    <NIP07Context.Provider value={nip07}>{children}</NIP07Context.Provider>
  );
};
