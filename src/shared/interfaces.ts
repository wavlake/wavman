// event kind 32123

export interface WavlakeEvent {
  title: string;
  description: string;
  link: string;
  author: string;
  medium: string; // use an enum? 
  guid: string;
  creator: string;
  pubDate: string; // use Date type instead?
  enclosure: string;
  episode: number; // always a number?
  season: number; // always a number?
  duration: string;
  version: string;
};
