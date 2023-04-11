import {
  getFilteredPageActions,
  PageView,
  PLAYER_VIEW,
} from "../../lib/shared";

const buttonColorCalc = (selected: boolean, currentPage: PageView) => {
  if (selected) {
    return currentPage === PLAYER_VIEW
      ? "bg-black text-wavgreen"
      : "bg-black text-violet-400";
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
  commenterPubKey?: string;
}> = ({ selectedActionIndex, currentPage, commenterPubKey }) => {
  const filteredActions = getFilteredPageActions(
    currentPage,
    "ZAP",
    commenterPubKey
  );
  return (
    <div className="mx-auto mb-1 flex w-56 justify-around text-xs">
      {filteredActions.map((action, index) => (
        <Action
          action={action}
          key={action}
          selected={selectedActionIndex === index}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
};

export default OnScreenActions;
