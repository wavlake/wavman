import {
  Event,
  UnsignedEvent,
  signEvent,
  generatePrivateKey,
  getEventHash,
} from "nostr-tools";

export interface WavlakeEventContent {
  title: string;
  description: string;
  link: string;
  type: string; // MIME type
  guid: string;
  creator: string;
  published_at: string;
  enclosure: string;
  duration: string;
  version: string;
}

// generate a throwaway private key for mock data and mock comments
export const publisherPrivateKey = generatePrivateKey();
export const commenterPrivateKey = generatePrivateKey();

export const signTrackEvent = (event: UnsignedEvent): Event => ({
  ...event,
  id: getEventHash(event),
  sig: signEvent(event, publisherPrivateKey),
});

export const signCommentEvent = (event: UnsignedEvent): Event => ({
  ...event,
  id: getEventHash(event),
  sig: signEvent(event, commenterPrivateKey),
});
