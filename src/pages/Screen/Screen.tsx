import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import OnScreenActions from "./OnScreenActions";
import ReactPlayerWrapper from "../ReactPlayerWrapper";
import {
  COMMENTS_VIEW,
  PageView,
  PLAYER_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "../shared";
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
  if (!nowPlayingTrack) return <div>Track Loading Screen</div>;

  const trackContent: WavlakeEventContent = JSON.parse(nowPlayingTrack.content);

  return (
    <div
      className={`h-80 w-80 ${
        pageView === PLAYER_VIEW ? "bg-emerald-200" : "bg-violet-400"
      }`}
    >
      <FormProvider {...methods}>
        <ReactPlayerWrapper
          url={trackContent.enclosure}
          isPlaying={isPlaying}
        />
        <form onSubmit={methods.handleSubmit(submitHandler)}>
          {(() => {
            switch (pageView) {
              case COMMENTS_VIEW:
                return (
                  <CommentsScreen
                    loading={commentsLoading}
                    comments={comments || []}
                  />
                );
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
    </div>
  );
};

export default Screen;
