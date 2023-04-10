import { useNIP07Login } from "@/nostr/useNIP07Login";
import {
  COMMENTS_VIEW,
  PageView,
  pageViewActionMap,
  PLAYER_VIEW,
  SPLASH_VIEW,
  ZAP_VIEW,
} from "../../lib/shared";

const buttonColorCalc = (selected: boolean, pageView: PageView) => {
  if (selected) {
    return pageView === PLAYER_VIEW
      ? "bg-black text-wavgreen"
      : "bg-black text-violet-400";
  } else {
    return "bg-transparent";
  }
};

const Action: React.FC<{
  action: string;
  selected: boolean;
  pageView: PageView;
}> = ({ action, selected, pageView }) => (
  <div className={buttonColorCalc(selected, pageView)}>{action}</div>
);

const OnScreenActions: React.FC<{
  selectedActionIndex: number;
  pageView: PageView;
}> = ({ selectedActionIndex, pageView }) => {
  const { publicKey } = useNIP07Login();
  const filteredActions = pageViewActionMap[pageView].filter(action => publicKey ? true : action !== "ZAP");
  return (
    <div className="mx-auto flex w-56 justify-around text-xs">
      {filteredActions.map((action, index) => (
        <Action
          action={action}
          key={action}
          selected={selectedActionIndex === index}
          pageView={pageView}
        />
      ))}
    </div>
  )
};

export default OnScreenActions;
