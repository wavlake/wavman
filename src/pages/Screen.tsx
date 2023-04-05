import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import ReactPlayerWrapper from "./ReactPlayerWrapper";
import { WavlakeEventContent } from "@/nostr";
import { Event } from "nostr-tools";
import { FormProvider, useForm } from "react-hook-form";

const Screen: React.FC<{
  isPlaying: boolean;
  submitHandler: (data: any) => void;
  commentsLoading: boolean;
  comments: Event[];
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  submitHandler,
  commentsLoading,
  comments,
  nowPlayingTrack,
}) => {
  if (!nowPlayingTrack) return <div>Track Loading Screen</div>;

  const trackContent: WavlakeEventContent = JSON.parse(nowPlayingTrack.content);
  const methods = useForm({
    defaultValues: {
      comment: "",
    },
  });

  return (
    <>
      <ReactPlayerWrapper url={trackContent.enclosure} isPlaying={isPlaying} />
      <NowPlayingScreen trackContent={trackContent} isPlaying={isPlaying} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitHandler)}>
          <CommentsScreen loading={commentsLoading} comments={comments || []} />
        </form>
      </FormProvider>
    </>
  );
};

export default Screen;
