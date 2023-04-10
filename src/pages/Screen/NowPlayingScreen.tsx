import { WavlakeEventContent } from "@/nostr";

// Fix a build error where title and artist are undefined

const TrackInfo: React.FC<{
  title: string;
  artist: string;
}> = ({ title, artist }) => (
  <div className="mx-auto grid items-center justify-center overflow-hidden text-base font-bold">
    <div
      className={`${
        artist?.length > 20
          ? "w-full animate-marquee whitespace-nowrap"
          : "whitespace w-64 justify-center"
      } flex place-self-center text-center no-scrollbar`}
    >
      <p>{artist}</p>
    </div>
    <div
      className={`${
        title?.length > 10 ? `animate-marquee` : `justify-center`
      } flex h-12 w-full whitespace-nowrap no-scrollbar`}
    >
      <p>{`"${title}"`}</p>
    </div>
  </div>
);

const MusicNotes: React.FC<{
  isPlaying: boolean;
}> = ({ isPlaying }) => (
  <div className="grid grid-cols-5 grid-rows-1 place-items-center gap-x-0 text-base font-bold">
    <div
      className={` ${
        isPlaying ? "animate-dance animation-delay-400" : ""
      } col-span-1 col-start-2 text-4xl`}
    >
      <img className="h-12" src={"note.svg"} />
    </div>
    <div className={` ${isPlaying ? "animate-dance" : ""} col-span-1 text-4xl`}>
      <img className="h-12" src={"note.svg"} />
    </div>
    <div
      className={` ${
        isPlaying ? "animate-dance animation-delay-800" : ""
      } col-span-1 text-4xl`}
    >
      <img className="h-12" src={"note.svg"} />
    </div>
  </div>
);

const NowPlayingScreen: React.FC<{
  isPlaying: boolean;
  trackContent: WavlakeEventContent;
}> = ({ trackContent, isPlaying }) => {
  return (
    <div className="h-40 w-[19rem]">
      <TrackInfo title={trackContent?.title} artist={trackContent?.creator} />
      <MusicNotes isPlaying={isPlaying} />
    </div>
  );
};

export default NowPlayingScreen;
