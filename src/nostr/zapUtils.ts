import {
  UnsignedEvent,
  generatePrivateKey,
  getPublicKey,
  Event,
  getEventHash,
  signEvent,
  Relay,
  Filter,
  SubscriptionOptions,
} from "nostr-tools";

const protocol = process.env.NEXT_PUBLIC_LNURL_PROTOCOL;

const chopDecimal = (amount: number) => Math.floor(amount);
export const sats2millisats = (amount: number) => chopDecimal(amount) * 1000;
export const millisats2sats = (amount: number) => chopDecimal(amount) / 1000;
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
  const unsignedEvent: UnsignedEvent = {
    kind: 9734,
    content,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["relays", "wss://relay.wavlake.com/"],
      ["amount", sats2millisats(amount).toString()],
      ["lnurl", lnurl],
      ["p", recepientPubKey],
      ["e", zappedEvent.id],
    ],
  };

  try {
    const signedEvent = await window.nostr?.signEvent?.(unsignedEvent);
    return signedEvent;
  } catch {
    console.log(
      "Unable to sign event with NIP-07 extension, falling back to an anon zap"
    );
    // if user rejects prompt, fallback to anon
    const signedEvent = signAnonZapEvent({
      content,
      amount,
      lnurl,
      recepientPubKey,
      zappedEvent,
    });
    return signedEvent;
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
      ["amount", sats2millisats(amount).toString()],
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

  // this is a hack to address the move of the wavlake endpoint from www.wavlake.com to wavlake.com
  // the proper fix is to update the events to include the new domain
  return `${protocol}://${domain.replace("www.", "")}/.well-known/lnurlp/${username}`;
};

export const fetchLNURLInfo = async (
  lnurl: string
): Promise<{
  allowsNostr?: boolean;
  callback?: string;
  nostrPubkey?: string;
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
      nostrPubkey,
      tag,
    } = await res.json();

    if (!validateNostrPubKey(nostrPubkey)) {
      throw `Invalid nostr pubkey ${nostrPubkey}`;
    }
    if (!allowsNostr) {
      throw "lnurl does not allow nostr";
    }

    return { allowsNostr, callback, nostrPubkey };
  } catch (err) {
    console.error("Error fetching lnurl info", { err, lnurl });
    return { error: "Error fetching lnurl info" };
  }
};

export const sendZapRequestReceivePaymentRequest = async ({
  signedZapEvent,
  callback,
  amount,
  lnurl,
}: {
  signedZapEvent: Event;
  callback: string;
  // in satoshis
  amount: number;
  lnurl: string;
}): Promise<string | undefined> => {
  // https://github.com/nostr-protocol/nips/blob/master/57.md#appendix-b-zap-request-http-request
  const event = JSON.stringify(signedZapEvent);
  const encodedEvent = encodeURI(event);
  const url = `${callback}?amount=${sats2millisats(
    amount
  )}&nostr=${encodedEvent}&lnurl=${lnurl}`;
  const paymentRequestRes = await fetch(url);
  const { pr } = await paymentRequestRes.json();

  if (!pr) {
    console.error({ callback, lnurl, signedZapEvent });
    throw "Error fetching payment request";
  }
  return pr;
};

export const getDTagFromEvent = (event?: Event): string => {
  const [tagType, aTag] =
    event?.tags?.find(([tagType]) => tagType === "a") || [];
  return aTag?.replace("32123:", "")?.split(":")?.[1] || "";
};

export const listEvents = async (
  relay: Relay,
  filter: Filter[],
  opts?: SubscriptionOptions
) => {
  if (relay) {
    if (relay.status === 3) await relay.connect();
    const events = await relay.list(filter, opts);
    return events;
  }
};
