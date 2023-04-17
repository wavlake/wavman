import { getPageActions, PageView, PLAYER_VIEW } from "../../lib/shared";

const buttonColorCalc = (selected: boolean, currentPage: PageView) => {
  if (selected) {
    return "bg-black text-wavgreen px-1 py-1"
  } else {
    return "bg-transparent";
  }
};

const Action: React.FC<{
  action: string;
  selected: boolean;
  currentPage: PageView;
}> = ({ action, selected, currentPage }) => (
  <div className={buttonColorCalc(selected, currentPage)}>{action}</div>
);

const OnScreenActions: React.FC<{
  selectedActionIndex: number;
  currentPage: PageView;
  isCenterButtonPressed: boolean;
  isPlaying: boolean;
  commenterPubKey?: string;
}> = ({
  selectedActionIndex,
  currentPage,
  isCenterButtonPressed,
  isPlaying,
  commenterPubKey,
}) => {
  // can use this to animate the current selection while center button is pressed
  // console.log({isCenterButtonPressed})

  const filteredActions = getPageActions(currentPage);
  return (
    <div className="mx-auto flex w-56 items-center justify-between text-xs">
      {filteredActions.map((action, index) => (
        <Action
          action={action === "PLAY" ? (isPlaying ? "PAUSE" : "PLAY") : action}
          key={action}
          selected={selectedActionIndex === index}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
};

export default OnScreenActions;
