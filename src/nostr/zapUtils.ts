import {
  UnsignedEvent,
  generatePrivateKey,
  getPublicKey,
  Event,
} from "nostr-tools";

const protocol = process.env.NEXT_PUBLIC_LNURL_PROTOCOL;

export const sats2millisats = (amount: number) => amount * 1000;
export const chopDecimal = (amount: number) => Math.floor(amount);
export const generateLNURLFromZapTag = (zapTag: string[]) => {
  const [zap, zapAddress, lud] = zapTag;
  const [username, domain] = zapAddress.split("@");
  if (!username || !domain) return false;
  return `${protocol}://${domain}/.well-known/lnurlp/${username}`;
};
export const validateNostrPubKey = (nostrPubKey: string) => {
  if (
    nostrPubKey == null ||
    nostrPubKey === undefined ||
    typeof nostrPubKey !== "string"
  ) {
    return false;
  }
  const schnorrSignatureRegex = /^[a-fA-F0-9]{64}$/;
  if (!schnorrSignatureRegex.test(nostrPubKey)) {
    return false;
  }

  return true;
};

export const getAnonPubKey = () => {
  const anonPrivKey = generatePrivateKey();
  const anonPubKey = getPublicKey(anonPrivKey);
  return { anonPrivKey, anonPubKey };
};

export const signZapEventNip07 = async ({
  content,
  amount,
  lnurl,
  recepientPubKey,
  zappedEvent,
  pubkey,
}: {
  content: string;
  amount: number;
  lnurl: string;
  recepientPubKey: string;
  zappedEvent: Event;
  pubkey: string;
}): Promise<Event | void> => {
  try {
    const unsignedEvent: UnsignedEvent = {
      kind: 9734,
      content,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["relays", "wss://relay.wavlake.com/"],
        ["amount", amount.toString()],
        ["lnurl", lnurl],
        ["p", recepientPubKey],
        ["e", zappedEvent.id],
      ],
    };

    const signedEvent: Event | undefined = await window.nostr?.signEvent?.(
      unsignedEvent
    );
    return signedEvent;
  } catch (err) {
    console.log("error signing zap event", { err, lnurl, zappedEvent });
  }
};
