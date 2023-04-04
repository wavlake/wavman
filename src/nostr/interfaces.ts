import { Event, UnsignedEvent, signEvent, generatePrivateKey, getPublicKey, getEventHash } from "nostr-tools"
// event kind 32123
export interface WavlakeEventContent {
  title: string;
  description: string;
  link: string;
  type: string; // MIME type
  guid: string;
  creator: string;
  pubDate: string;
  enclosure: string;
  duration: string;
  version: string;
};

export interface SignedEventKind32123 extends Omit<Event, 'kind'> {
  kind: 32123,
};

export interface UnsignedEventKind32123 extends Omit<UnsignedEvent, 'kind'> {
  kind: 32123,
};

// generate a throwaway private key for mock data and mock comments
export const publisherPrivateKey = generatePrivateKey();
export const commenterPrivateKey = generatePrivateKey();

export const signTrackEvent = (event: UnsignedEventKind32123): SignedEventKind32123 => ({
  ...event,
  id: getEventHash(event),
  sig: signEvent(event, publisherPrivateKey),
});

export const signCommentEvent = (event: UnsignedEvent): Event => ({
  ...event,
  id: getEventHash(event),
  sig: signEvent(event, commenterPrivateKey)
});
