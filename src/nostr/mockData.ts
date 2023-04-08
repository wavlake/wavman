import {
  signCommentEvent,
  commenterPrivateKey,
  signTrackEvent,
  WavlakeEventContent,
  publisherPrivateKey,
} from "./interfaces";
import { UnsignedEvent, Event, getEventHash } from "nostr-tools";

const wavlakeEventContent: WavlakeEventContent = {
  title: "I Can Be",
  description: "I Can Be",
  link: "https://www.wavlake.com/album/9cbf460f-60e2-4271-87a2-93b8e0520a95",
  type: "audio/mpeg",
  guid: "87c0d2f9-909f-48ce-8b02-3986aa9b0013",
  creator: "Official DETOX Music",
  pubDate: "Sat, 04 Mar 2023 20:35:29 GMT",
  enclosure:
    "https://d12wklypp119aj.cloudfront.net/track/87c0d2f9-909f-48ce-8b02-3986aa9b0013.mp3",
  duration: "00:04:03",
  version: "1.0",
};

export const unsignedMockTrackEvent: UnsignedEvent = {
  content: JSON.stringify(wavlakeEventContent),
  kind: 1,
  tags: [],
  created_at: 12345,
  pubkey: publisherPrivateKey,
};

export const signedMockTrackEvent: Event = signTrackEvent(
  unsignedMockTrackEvent
);

export const mockComments: Event[] = Array.from(Array(4).keys()).map(
  (comment) =>
    signCommentEvent({
      content: `test comment #${comment}`,
      kind: 1,
      tags: [["e", getEventHash(signedMockTrackEvent)]],
      created_at: 12345 + comment,
      pubkey: commenterPrivateKey,
    })
);
