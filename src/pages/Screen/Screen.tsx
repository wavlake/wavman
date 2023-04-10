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
  zapError: string;
  nowPlayingTrack?: Event;
}> = ({
  isPlaying,
  commentsLoading,
  comments,
  pageView,
  selectedActionIndex,
  paymentRequest,
  zapError,
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
    <div className="relative my-4 mx-4 border-8 border-black p-2">
      <div
        className={`flex flex-col h-56 w-56 justify-center ${getScreenColor()}`}
      >
        {/* <img className="absolute h-64 opacity-20" src={"SCREENDOOR.svg"} /> */}
        {(() => {
          if (!nowPlayingTrack)
            return (
              <div>
                <img className="mx-auto h-20 animate-fadein" src={"wavlake.svg"} />
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
                    return <ZapScreen zapError={zapError} />;
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
      <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -left-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -bottom-2 h-2 w-2 bg-wavgray"></div>
    </div>
  );
};

export default Screen;
