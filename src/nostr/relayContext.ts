import { Relay } from "nostr-tools";
import { createContext } from "react";

export const RelayContext = createContext<{ relay: Relay | null }>({
  relay: null,
});
