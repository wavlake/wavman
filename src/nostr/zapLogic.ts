import { Event, UnsignedEvent, getEventHash } from "nostr-tools";
import { NIP07ContextType } from "./useNIP07Login";

const sats2millisats = (amount: number) => amount * 1000;
const chopDecimal = (amount: number) => Math.floor(amount);
const generateLNURLFromZapTag = (zapTag: string[]) => {
  const [zap, zapAddress, lud] = zapTag;
  const [username, domain] = zapAddress.split("@");
  if (!username || !domain) return false;
  return`http://${domain}/.well-known/lnurlp/${username}`
};
const validateNostrPubKey = (nostrPubKey: string) => {
  if (nostrPubKey == null || nostrPubKey === undefined || typeof nostrPubKey !== 'string') {
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
  nip07,
}: {
  content: string;
  amount: number;
  lnurl: string;
  recepientPubKey: string;
  zappedEvent: Event;
  nip07: NIP07ContextType;
}): Promise<Event | void> => {
  if (!nip07?.publicKey || !nip07?.signEvent) {
    console.log('nip07 not initialized, unable to zap')
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
      ["e", zappedEvent.id]
    ],
    pubkey: nip07.publicKey,
    created_at: Math.floor(Date.now() / 1000),
  };

  const signedEvent = await nip07.signEvent(unsignedEvent)
  if (!signedEvent) return;
  return signedEvent;
};
export const getInvoice = async ({
  nowPlayingTrack,
  satAmount: amount,
  content,
  nip07,
}: {
  nowPlayingTrack: Event;
  satAmount: number;
  content: string;
  nip07: NIP07ContextType;
}): Promise<string | undefined> => {
  const zapTag = nowPlayingTrack.tags.find((tag) => tag[0] === "zap");
  const lnurl = zapTag && generateLNURLFromZapTag(zapTag)
  if (!lnurl) {
    console.log(`failed to parse lnurl from event's zap tag`, { zapTag } )
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
    console.log('lnurl does not allow nostr')
    return;
  }
  if (!validateNostrPubKey(nostrPubKey)) {
    console.log('invalid nostr pubkey', { nostrPubKey })
    return;
  }

  const milliSatAmount = sats2millisats(chopDecimal(amount));
  const zapEvent = await signZapEvent({
    content,
    amount: milliSatAmount,
    lnurl,
    recepientPubKey: nostrPubKey,
    zappedEvent: nowPlayingTrack,
    nip07,
  });

  const event = encodeURI(JSON.stringify(zapEvent));
  const paymentRequestRes = await fetch(`${callback}?amount=${milliSatAmount}&nostr=${event}&lnurl=${lnurl}`);
  const { pr } = await paymentRequestRes.json();
  return pr;
}