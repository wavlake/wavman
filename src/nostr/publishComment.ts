import { UnsignedEvent, Event } from "nostr-tools";

// currently not in use
export const publishCommentEvent = async ({
  content,
  nowPlayingTrack,
  publishEvent,
}: {
  content: string;
  nowPlayingTrack: Event;
  publishEvent: (event: Event) => void;
}) => {
  try {
    const commenterPubKey = (await window.nostr?.getPublicKey()) || "";
    const unsigned: UnsignedEvent = {
      kind: 1,
      content,
      tags: [["e", nowPlayingTrack.id]],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: commenterPubKey,
    };
    const signedEvent = await window.nostr?.signEvent?.(unsigned);
    if (!signedEvent) throw "Error signing event with nip-07";
    publishEvent(signedEvent);
  } catch (err) {
    console.log("error publishing comment event", { err, nowPlayingTrack });
  }
};
