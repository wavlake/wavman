import ReactPlayerWrapper from "../ReactPlayerWrapper";
import NowPlayingScreen from "./NowPlayingScreen";
import OnScreenActions from "./OnScreenActions";
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
import QRScreen from "./QRScreen";
import ZapScreen from "./ZapScreen";
import CommentsScreen from "./CommentsScreen";

const Screen: React.FC<{
  isPlaying: boolean;
  commentsLoading: boolean;
  comments: Event[];
  pageView: PageView;
  selectedActionIndex: number;
  paymentRequest: string;
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  commentsLoading,
  comments,
  pageView,
  selectedActionIndex,
  paymentRequest,
  nowPlayingTrack,
}) => {

  const getScreenColor = () => {
    switch (pageView) {
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
          <>
            <ReactPlayerWrapper
              url={trackContent.enclosure}
              isPlaying={isPlaying}
            />
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
                case QR_VIEW:
                  return <QRScreen paymentRequest={paymentRequest} />;
                case ZAP_VIEW:
                  return <ZapScreen />;
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
          </>
        );
      })()}
    </div>
  );
};

export default Screen;
