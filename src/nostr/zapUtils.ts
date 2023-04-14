import {
  UnsignedEvent,
  generatePrivateKey,
  getPublicKey,
  Event,
  getEventHash,
  signEvent,
} from "nostr-tools";

const protocol = process.env.NEXT_PUBLIC_LNURL_PROTOCOL;

export const sats2millisats = (amount: number) => amount * 1000;
export const chopDecimal = (amount: number) => Math.floor(amount);
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
}): Promise<Event> => {
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
    if (!signedEvent) {
      // fallback and return an anon zap
      // should this move to the catch block?
      return signAnonZapEvent({
        content,
        amount,
        lnurl,
        recepientPubKey,
        zappedEvent,
      });
    }
    return signedEvent;
  } catch (err) {
    console.error({ err, lnurl, zappedEvent });
    throw "Error signing event with NIP-07";
  }
};

export const signAnonZapEvent = async ({
  content,
  amount,
  lnurl,
  recepientPubKey,
  zappedEvent,
}: {
  content: string;
  amount: number;
  lnurl: string;
  recepientPubKey: string;
  zappedEvent: Event;
}): Promise<Event> => {
  const { anonPubKey, anonPrivKey } = getAnonPubKey();

  const unsignedEvent: UnsignedEvent = {
    kind: 9734,
    content,
    pubkey: anonPubKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["relays", "wss://relay.wavlake.com/"],
      ["amount", amount.toString()],
      ["lnurl", lnurl],
      ["p", recepientPubKey],
      ["e", zappedEvent.id],
    ],
  };
  return {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: signEvent(unsignedEvent, anonPrivKey),
  };
};

export const getLNURLFromEvent = (event: Event): string | undefined => {
  const zapTag = event.tags.find((tag) => tag[0] === "zap");
  if (!zapTag) return;

  const [zap, zapAddress, lud] = zapTag;
  const [username, domain] = zapAddress.split("@");
  if (!username || !domain) return;

  return `${protocol}://${domain}/.well-known/lnurlp/${username}`;
};

export const fetchLNURLInfo = async (
  lnurl: string
): Promise<{
  allowsNostr?: boolean;
  callback?: string;
  nostrPubKey?: string;
  error?: string;
}> => {
  try {
    const res = await fetch(lnurl);
    const {
      allowsNostr,
      callback,
      maxSendable,
      metadata,
      minSendable,
      nostrPubKey,
      tag,
    } = await res.json();

    if (!validateNostrPubKey(nostrPubKey)) {
      throw `Invalid nostr pubkey ${nostrPubKey}`;
    }
    if (!allowsNostr) {
      throw "lnurl does not allow nostr";
    }

    return { allowsNostr, callback, nostrPubKey };
  } catch (err) {
    console.error("Error fetching lnurl info", { err, lnurl });
    return { error: "Error fetching lnurl info" };
  }
};

export const sendZapRequestReceivePaymentRequest = async ({
  signedZapEvent,
  callback,
  milliSatAmount,
  lnurl,
}: {
  signedZapEvent: Event;
  callback: string;
  milliSatAmount: number;
  lnurl: string;
}): Promise<string | undefined> => {
  const event = JSON.stringify(signedZapEvent);
  const paymentRequestRes = await fetch(
    `${callback}?amount=${milliSatAmount}&nostr=${event}&lnurl=${lnurl}`
  );
  const { pr } = await paymentRequestRes.json();

  if (!pr) {
    console.error({ callback, lnurl, signedZapEvent });
    throw "Error fetching payment request";
  }
  return pr;
};
