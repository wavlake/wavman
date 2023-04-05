import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import ReactPlayerWrapper from "./ReactPlayerWrapper";
import { WavlakeEventContent } from "@/nostr";
import { Event } from "nostr-tools";
import { FormProvider, useForm } from "react-hook-form";
import { COMMENTS_VIEW, PageView, PLAYER_VIEW, SPLASH_VIEW, ZAP_VIEW } from "./shared";

const Screen: React.FC<{
  isPlaying: boolean;
  submitHandler: (data: any) => void;
  commentsLoading: boolean;
  comments: Event[];
  pageView: PageView;
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  submitHandler,
  commentsLoading,
  comments,
  pageView,
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
    <FormProvider {...methods}>
      <ReactPlayerWrapper url={trackContent.enclosure} isPlaying={isPlaying} />
      <form onSubmit={methods.handleSubmit(submitHandler)}>
        {(() => {
          switch(pageView) {
            case COMMENTS_VIEW:
              return <CommentsScreen loading={commentsLoading} comments={comments || []} />;
            case PLAYER_VIEW:
              return <NowPlayingScreen trackContent={trackContent} isPlaying={isPlaying} />;
            case ZAP_VIEW:
              return <>zap</>;
            case SPLASH_VIEW:
              return <>splash</>;
            default:
              return <>default</>;
          }
        })()}
      </form>
    </FormProvider>
  );
};

export default Screen;
