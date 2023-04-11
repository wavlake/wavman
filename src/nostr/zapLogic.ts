import { Nip07SignEvent } from "./useNIP07Login";
import { Event, UnsignedEvent } from "nostr-tools";

const protocol = process.env.NEXT_PUBLIC_LNURL_PROTOCOL;

const sats2millisats = (amount: number) => amount * 1000;
const chopDecimal = (amount: number) => Math.floor(amount);
const generateLNURLFromZapTag = (zapTag: string[]) => {
  const [zap, zapAddress, lud] = zapTag;
  const [username, domain] = zapAddress.split("@");
  if (!username || !domain) return false;
  return `${protocol}://${domain}/.well-known/lnurlp/${username}`;
};
const validateNostrPubKey = (nostrPubKey: string) => {
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

const signZapEvent = async ({
  content,
  amount,
  lnurl,
  recepientPubKey,
  zappedEvent,
  commenterPubKey,
  signEvent,
}: {
  content: string;
  amount: number;
  lnurl: string;
  recepientPubKey: string;
  zappedEvent: Event;
  commenterPubKey: string;
  signEvent: Nip07SignEvent;
}): Promise<Event | void> => {
  try {
    if (!commenterPubKey || !signEvent) {
      console.log("nip07 not initialized, unable to zap");
      return;
    }

    const unsignedEvent: UnsignedEvent = {
      kind: 9734,
      content,
      tags: [
        ["relays", "wss://relay.wavlake.com/"],
        ["amount", amount.toString()],
        ["lnurl", lnurl],
        ["p", recepientPubKey],
        ["e", zappedEvent.id],
      ],
      pubkey: commenterPubKey,
      created_at: Math.floor(Date.now() / 1000),
    };

    const signedEvent = await signEvent(unsignedEvent);
    if (!signedEvent) return;
    return signedEvent;
  } catch (err) {
    console.log("error signing zap event", { err, lnurl, zappedEvent });
  }
};
export const getInvoice = async ({
  nowPlayingTrack,
  satAmount: amount,
  content,
  commenterPubKey,
  signEvent,
}: {
  nowPlayingTrack: Event;
  satAmount: number;
  content: string;
  commenterPubKey: string;
  signEvent: Nip07SignEvent;
}): Promise<string | undefined> => {
  try {
    const zapTag = nowPlayingTrack.tags.find((tag) => tag[0] === "zap");
    const lnurl = zapTag && generateLNURLFromZapTag(zapTag);
    if (!lnurl) {
      console.log(`failed to parse lnurl from event's zap tag`, { zapTag });
      return;
    }
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

    if (!allowsNostr) {
      console.log("lnurl does not allow nostr");
      return;
    }
    if (!validateNostrPubKey(nostrPubKey)) {
      console.log("invalid nostr pubkey", { nostrPubKey });
      return;
    }

    const milliSatAmount = sats2millisats(chopDecimal(amount));
    const zapEvent = await signZapEvent({
      content,
      amount: milliSatAmount,
      lnurl,
      recepientPubKey: nostrPubKey,
      zappedEvent: nowPlayingTrack,
      commenterPubKey,
      signEvent,
    });

    const event = encodeURI(JSON.stringify(zapEvent));
    const paymentRequestRes = await fetch(
      `${callback}?amount=${milliSatAmount}&nostr=${event}&lnurl=${lnurl}`
    );
    const { pr } = await paymentRequestRes.json();
    return pr;
  } catch (err) {
    console.log("error getting invoice", { err, nowPlayingTrack });
  }
};

export const publishCommentEvent = async ({
  commenterPubKey,
  signEvent,
  content,
  nowPlayingTrack,
  publishEvent,
}: {
  commenterPubKey: string;
  signEvent: Nip07SignEvent;
  content: string;
  nowPlayingTrack: Event;
  publishEvent: (event: Event) => void;
}) => {
  const unsigned: UnsignedEvent = {
    kind: 1,
    content,
    tags: [["e", nowPlayingTrack.id]],
    created_at: Math.floor(Date.now() / 1000),
    pubkey: commenterPubKey,
  };
  const signedEvent = await signEvent?.(unsigned);
  signedEvent && publishEvent(signedEvent);
};
