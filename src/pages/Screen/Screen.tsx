import ReactPlayerWrapper from "../ReactPlayerWrapper";
// import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import OnScreenActions from "./OnScreenActions";
import {
  // COMMENTS_VIEW,
  PageView,
  PLAYER_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "@/lib/shared";
import { WavlakeEventContent } from "@/nostr";
import { Event } from "nostr-tools";
import { FormProvider, useForm } from "react-hook-form";

const Screen: React.FC<{
  isPlaying: boolean;
  submitHandler: (data: any) => void;
  commentsLoading: boolean;
  comments: Event[];
  pageView: PageView;
  selectedActionIndex: number;
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  submitHandler,
  commentsLoading,
  comments,
  pageView,
  selectedActionIndex,
  nowPlayingTrack,
}) => {
  const methods = useForm({
    defaultValues: {
      comment: "",
    },
  });
  const getScreenColor = () => {
    switch (pageView) {
      case PLAYER_VIEW:
        return "bg-wavgreen";
      // case COMMENTS_VIEW:
      //   return "bg-wavgreen";
      case ZAP_VIEW:
        return "bg-wavpurple";
      case SPLASH_VIEW:
      default:
        return "bg-wavdarkgreen";
    }
  };

  return (
    <div
      className={`flex h-56 w-64 items-center justify-center ${getScreenColor()}`}
    >
      {/* <img className="absolute h-64 opacity-20" src={"SCREENDOOR.svg"} /> */}
      {(() => {
        if (!nowPlayingTrack)
          return (
            <div>
              <img className="h-20 animate-fadein" src={"wavlake.svg"} />
            </div>
          );
        const trackContent: WavlakeEventContent = JSON.parse(
          nowPlayingTrack?.content
        );

        return (
          <FormProvider {...methods}>
            <ReactPlayerWrapper
              url={trackContent.enclosure}
              isPlaying={isPlaying}
            />

            <form onSubmit={methods.handleSubmit(submitHandler)}>
              {(() => {
                switch (pageView) {
                  // case COMMENTS_VIEW:
                  //   return (
                  //     <CommentsScreen
                  //       loading={commentsLoading}
                  //       comments={comments || []}
                  //     />
                  //   );
                  case PLAYER_VIEW:
                    return (
                      <NowPlayingScreen
                        trackContent={trackContent}
                        isPlaying={isPlaying}
                      />
                    );
                  case ZAP_VIEW:
                    return <>zap</>;
                  case SPLASH_VIEW:
                    return <>splash</>;
                  default:
                    return <>default</>;
                }
              })()}
              <OnScreenActions
                selectedActionIndex={selectedActionIndex}
                pageView={pageView}
              />
            </form>
          </FormProvider>
        );
      })()}
    </div>
  );
};

export default Screen;
