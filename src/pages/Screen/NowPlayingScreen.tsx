import { WavlakeEventContent } from "@/nostr";

const TrackInfo: React.FC<{
  title: string;
  artist: string;
}> = ({ title, artist }) => (
  <div className="grid items-center justify-center text-lg font-bold">
    <p className="mx-auto flex text-center">{artist}</p>
    <p className="mx-auto flex text-center">{`"${title}"`}</p>
  </div>
);

const MusicNotes: React.FC<{
  isPlaying: boolean;
}> = ({ isPlaying }) => (
  <div className="my-8 grid grid-cols-3 grid-rows-1 place-items-center gap-x-0 text-lg font-bold">
    <div
      className={` ${
        isPlaying ? "animate-dance animation-delay-400" : ""
      } col-span-1 text-4xl`}
    >
      <img className="h-16" src={"note.svg"} />
    </div>
    <div className={` ${isPlaying ? "animate-dance" : ""} col-span-1 text-4xl`}>
      <img className="h-16" src={"note.svg"} />
    </div>
    <div
      className={` ${
        isPlaying ? "animate-dance animation-delay-800" : ""
      } col-span-1 text-4xl`}
    >
      <img className="h-16" src={"note.svg"} />
    </div>
  </div>
);

const NowPlayingScreen: React.FC<{
  isPlaying: boolean;
  trackContent: WavlakeEventContent;
}> = ({ trackContent: { title, creator }, isPlaying }) => {
  return (
    <div className="">
      <TrackInfo title={title} artist={creator} />
      <MusicNotes isPlaying={isPlaying} />
    </div>
  );
};

export default NowPlayingScreen;
