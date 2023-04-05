import { WavlakeEventContent } from "@/nostr";

const TrackInfo: React.FC<{
  title: string;
  artist: string;
}> = ({ title, artist }) => (
  <div className="grid grid-cols-1">
    <div className="col-span-1">{artist}</div>
    <div className="col-span-1">{title}</div>
  </div>
);

const NowPlayingScreen: React.FC<{
  isPlaying: boolean;
  trackContent: WavlakeEventContent;
}> = ({ trackContent: { title, creator } }) => {
  return (
    <div className="">
      <TrackInfo title={title} artist={creator} />
    </div>
  );
};

export default NowPlayingScreen;
