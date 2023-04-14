import {
  chopDecimal,
  getLNURLFromEvent,
  sats2millisats,
  signZapEventNip07,
  fetchLNURLInfo,
  signAnonZapEvent,
  sendZapRequestReceivePaymentRequest,
} from "./zapUtils";
import {
  Event,
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
    const lnurl = getLNURLFromEvent(nowPlayingTrack);
    if (!lnurl) {
      console.log(`failed to parse lnurl from event`, { nowPlayingTrack });
      return;
    }
    const { allowsNostr, callback, nostrPubKey, error } = await fetchLNURLInfo(
      lnurl
    );
    if (error || !nostrPubKey || !callback || !allowsNostr) {
      console.error(error);
      return;
    }

    const milliSatAmount = sats2millisats(chopDecimal(amount));
    const nip07PubKey = await window.nostr?.getPublicKey();

    const signedZapEvent = nip07PubKey
      // sign with nip07
      ? await signZapEventNip07({
          content,
          amount: milliSatAmount,
          lnurl,
          recepientPubKey: nostrPubKey,
          zappedEvent: nowPlayingTrack,
          pubkey: nip07PubKey,
        })
      // sign as anon
      : await signAnonZapEvent({
          content,
          amount,
          lnurl,
          recepientPubKey: nostrPubKey,
          zappedEvent: nowPlayingTrack,
        });

    return sendZapRequestReceivePaymentRequest({
      signedZapEvent,
      callback,
      milliSatAmount,
      lnurl,
    });
  } catch (err) {
    console.log("Error getting invoice", { err, nowPlayingTrack });
  }
};
