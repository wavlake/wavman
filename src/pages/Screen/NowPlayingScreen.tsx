import { WavlakeEventContent } from "@/nostr";

// Fix a build error where title and artist are undefined

const TrackInfo: React.FC<{
  title: string;
  artist: string;
  link: string;
}> = ({ title, artist, link }) => (
  <div className="group mx-auto grid items-center justify-center overflow-hidden text-lg font-bold">
    <div
      className={`${
        artist?.length > 13
          ? "w-full animate-marquee whitespace-nowrap"
          : "whitespace w-64 justify-center"
      } group flex place-self-center text-center no-scrollbar`}
    >
      <p>{artist}</p>
    </div>

    <div
      className={`${
        title?.length > 10 ? `animate-marquee` : `justify-center`
      } group flex h-12 w-full whitespace-nowrap no-scrollbar group-hover:animate-blink`}
    >
      <p>
        <a
          href={`${link}`}
          target={"_blank"}
          rel={"noreferrer"}
        >{`"${title}"`}</a>
      </p>
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
      <img className="h-14" src={"note.svg"} />
    </div>
    <div className={` ${isPlaying ? "animate-dance" : ""} col-span-1 text-4xl`}>
      <img className="h-14" src={"note.svg"} />
    </div>
    <div
      className={` ${
        isPlaying ? "animate-dance animation-delay-800" : ""
      } col-span-1 text-4xl`}
    >
      <img className="h-14" src={"note.svg"} />
    </div>
  </div>
);

const NowPlayingScreen: React.FC<{
  isPlaying: boolean;
  trackContent: WavlakeEventContent;
}> = ({ trackContent, isPlaying }) => {
  return (
    <div className="h-36 w-72">
      <TrackInfo
        title={trackContent?.title}
        artist={trackContent?.creator}
        link={trackContent?.link}
      />
      <MusicNotes isPlaying={isPlaying} />
    </div>
  );
};

export default NowPlayingScreen;
