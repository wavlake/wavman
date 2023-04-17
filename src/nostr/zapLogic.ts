import {
  getLNURLFromEvent,
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

    try {
      const nip07PubKey = await window.nostr?.getPublicKey();
      if (nip07PubKey) {
        const signedZapEvent = await signZapEventNip07({
          content,
          amount,
          lnurl,
          recepientPubKey: nostrPubKey,
          zappedEvent: nowPlayingTrack,
          pubkey: nip07PubKey,
        })
        
        return sendZapRequestReceivePaymentRequest({
          signedZapEvent,
          callback,
          amount,
          lnurl,
        });
      } else {
        throw "Error getting pubkey from NIP-07 extension";
      }
    } catch (e) {
      console.error(e);
      console.log("Unable to sign event with NIP-07, falling back to an anon zap");
      const signedZapEvent = await signAnonZapEvent({
        content,
        amount,
        lnurl,
        recepientPubKey: nostrPubKey,
        zappedEvent: nowPlayingTrack,
      });

      return sendZapRequestReceivePaymentRequest({
        signedZapEvent,
        callback,
        amount,
        lnurl,
      });
    }
  } catch (err) {
    console.log("Error getting invoice", { err, nowPlayingTrack });
  }
};
