import ReactPlayerWrapper from "../ReactPlayerWrapper";
import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import OnScreenActions from "./OnScreenActions";
import QRScreen from "./QRScreen";
import ZapScreen from "./ZapScreen";
import {
  COMMENTS_VIEW,
  PageView,
  PLAYER_VIEW,
  QR_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "@/lib/shared";
import { WavlakeEventContent } from "@/nostr";
import { Event } from "nostr-tools";

const Screen: React.FC<{
  isPlaying: boolean;
  commentsLoading: boolean;
  comments: Event[];
  currentPage: PageView;
  selectedActionIndex: number;
  paymentRequest: string;
  zapError: string;
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  commentsLoading,
  comments,
  currentPage,
  selectedActionIndex,
  paymentRequest,
  zapError,
  nowPlayingTrack,
}) => {
  const getScreenColor = () => {
    switch (currentPage) {
      case PLAYER_VIEW:
        return "bg-wavgreen";
      case COMMENTS_VIEW:
      case QR_VIEW:
      case ZAP_VIEW:
        return "bg-wavpurple";
      case SPLASH_VIEW:
      default:
        return "bg-wavdarkgreen";
    }
  };

  return (
    <div className="relative mx-4 my-4 border-8 border-black p-2">
      <div
        className={`flex h-56 w-56 flex-col place-content-between ${getScreenColor()}`}
      >
        {/* <img className="absolute h-64 opacity-20" src={"SCREENDOOR.svg"} /> */}
        {(() => {
          if (!nowPlayingTrack)
            return (
              <div>
                <img
                  className="mx-auto mt-16 h-20 animate-fadein"
                  src={"wavlake.svg"}
                />
              </div>
            );
          const trackContent: WavlakeEventContent = JSON.parse(
            nowPlayingTrack?.content
          );

          return (
            <>
              <ReactPlayerWrapper
                url={trackContent.enclosure}
                isPlaying={isPlaying}
              />
              {(() => {
                switch (currentPage) {
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
                  case QR_VIEW:
                    return <QRScreen paymentRequest={paymentRequest} />;
                  case ZAP_VIEW:
                    return <ZapScreen zapError={zapError} />;
                  case SPLASH_VIEW:
                    return <>splash</>;
                  default:
                    return <>default</>;
                }
              })()}
              <OnScreenActions
                selectedActionIndex={selectedActionIndex}
                currentPage={currentPage}
              />
            </>
          );
        })()}
      </div>
      <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-wavgray"></div>
    </div>
  );
};

export default Screen;
