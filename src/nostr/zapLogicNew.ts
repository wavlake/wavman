import {
  chopDecimal,
  generateLNURLFromZapTag,
  getAnonPubKey,
  sats2millisats,
  signZapEventNip07,
  validateNostrPubKey,
} from "./zapUtils";
import {
  Event,
  UnsignedEvent,
  getEventHash,
  signEvent,
  validateEvent,
} from "nostr-tools";

export const getInvoice = async ({
  nowPlayingTrack,
  satAmount: amount,
  content,
}: {
  nowPlayingTrack: Event;
  satAmount: number;
  content: string;
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
    const nip07PubKey = await window.nostr?.getPublicKey();
    if (nip07PubKey) {
      const signedZapEvent = await signZapEventNip07({
        content,
        amount: milliSatAmount,
        lnurl,
        recepientPubKey: nostrPubKey,
        zappedEvent: nowPlayingTrack,
        pubkey: nip07PubKey,
      });
      const event = JSON.stringify(signedZapEvent);
      const paymentRequestRes = await fetch(
        `${callback}?amount=${milliSatAmount}&nostr=${event}&lnurl=${lnurl}`
      );
      const { pr } = await paymentRequestRes.json();
      return pr;
    } else {
      // anon zap
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
          ["p", nostrPubKey],
          ["e", nowPlayingTrack.id],
        ],
      };
      const signedZapEvent = {
        ...unsignedEvent,
        id: getEventHash(unsignedEvent),
        sig: signEvent(unsignedEvent, anonPrivKey),
      };
      const event = JSON.stringify(signedZapEvent);
      const paymentRequestRes = await fetch(
        `${callback}?amount=${milliSatAmount}&nostr=${event}&lnurl=${lnurl}`
      );
      const { pr } = await paymentRequestRes.json();
      return pr;
    }
  } catch (err) {
    console.log("error getting invoice", { err, nowPlayingTrack });
  }
};

// currently not in use
export const publishCommentEvent = async ({
  content,
  nowPlayingTrack,
  publishEvent,
  commenterPubKey,
}: {
  content: string;
  nowPlayingTrack: Event;
  publishEvent: (event: Event) => void;
  commenterPubKey?: string;
}) => {
  const { anonPubKey, anonPrivKey } = getAnonPubKey();
  try {
    const unsignedEvent: UnsignedEvent = {
      kind: 1,
      content,
      tags: [["e", nowPlayingTrack.id]],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: commenterPubKey || anonPubKey,
    };
    const signedEvent = await window.nostr
      ?.signEvent?.(unsignedEvent)
      .catch((e: string) => console.log(e));
    if (!signedEvent) {
      // use anonPrivKey
      const anonSignedEvent = {
        ...unsignedEvent,
        id: getEventHash(unsignedEvent),
        sig: signEvent(unsignedEvent, anonPrivKey),
      };
      publishEvent(anonSignedEvent);
    }

    publishEvent(signedEvent);
  } catch (err) {
    console.log("error publishing comment event", { err, nowPlayingTrack });
  }
};
