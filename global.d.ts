// this unused import fixes a window type error
import { WebLNProvider } from "@webbtc/webln-types";

interface NIP07 {
  getPublicKey: () => Promise<string | undefined>;
  signEvent: Nip07SignEvent;
}
declare global {
  interface Window {
    nostr?: NIP07;
  }
}
