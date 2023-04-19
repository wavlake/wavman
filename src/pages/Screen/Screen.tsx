import CommentsScreen from "./CommentsScreen";
import NowPlayingScreen from "./NowPlayingScreen";
import OnScreenActions from "./OnScreenActions";
import QRScreen from "./QRScreen";
import ZapAmountScreen from "./ZapAmountScreen";
import ZapCommentScreen from "./ZapCommentScreen";
import {
  COMMENTS_VIEW,
  PageView,
  PLAYER_VIEW,
  QR_VIEW,
  SPLASH_VIEW,
  ZAP_AMOUNT_VIEW,
  ZAP_COMMENT_VIEW,
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
  isCenterButtonPressed: boolean;
  nowPlayingTrackContent: WavlakeEventContent;
  commenterPubKey?: string;
}> = ({
  isPlaying,
  commentsLoading,
  comments,
  currentPage,
  selectedActionIndex,
  paymentRequest,
  zapError,
  isCenterButtonPressed,
  nowPlayingTrackContent,
  commenterPubKey,
}) => {
  const getScreenColor = () => {
    switch (currentPage) {
      case PLAYER_VIEW:
      case COMMENTS_VIEW:
      case QR_VIEW:
      case ZAP_AMOUNT_VIEW:
      case ZAP_COMMENT_VIEW:
        return "bg-wavgreen";
      case SPLASH_VIEW:
      default:
        return "bg-wavdarkgreen";
    }
  };

  return (
    <div className="relative mx-4 my-4 border-8 border-black p-2">
      <div className={`flex h-56 w-72 flex-col ${getScreenColor()}`}>
        {/* <img className="absolute h-64 opacity-20" src={"SCREENDOOR.svg"} /> */}
        <div className="flex flex-col">
          <div className="flex h-8 justify-end p-2">
            {currentPage !== SPLASH_VIEW && (
              <a
                href={`https://wavlake.com`}
                target={"_blank"}
                rel={"noreferrer"}
              >
                <img
                  className="h-4 opacity-80 hover:opacity-30"
                  src={"wavlake.svg"}
                />
              </a>
            )}
          </div>
          {(() => {
            switch (currentPage) {
              case COMMENTS_VIEW:
                return (
                  <div className="flex">
                    <CommentsScreen
                      loading={commentsLoading}
                      comments={comments || []}
                    />
                  </div>
                );
              case PLAYER_VIEW:
                return (
                  <div className="flex">
                    <NowPlayingScreen
                      trackContent={nowPlayingTrackContent}
                      isPlaying={isPlaying}
                    />
                  </div>
                );
              case QR_VIEW:
                return <QRScreen paymentRequest={paymentRequest} />;
              case ZAP_COMMENT_VIEW:
                return <ZapCommentScreen />;
              case ZAP_AMOUNT_VIEW:
                return <ZapAmountScreen zapError={zapError} />;
              case SPLASH_VIEW:
                return (
                  <img
                    className="mx-auto mt-10 h-20 animate-fadein"
                    src={"wavlake.svg"}
                  />
                );
              default:
                return <>default</>;
            }
          })()}
          <div className="mt-4 flex">
            <OnScreenActions
              selectedActionIndex={selectedActionIndex}
              currentPage={currentPage}
              commenterPubKey={commenterPubKey}
              isCenterButtonPressed={isCenterButtonPressed}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>
      <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-wavgray"></div>
    </div>
  );
};

export default Screen;
