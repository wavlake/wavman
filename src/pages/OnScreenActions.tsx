import { COMMENTS_VIEW, PageView, pageViewActionMap, PLAYER_VIEW, SPLASH_VIEW, ZAP_VIEW } from "./shared";

const buttonColorCalc = (selected: boolean, pageView: PageView) => {
  if (selected) {
    return pageView === PLAYER_VIEW ? "bg-black text-emerald-200" : "bg-black text-violet-400";
  } else {
    return "bg-transparent";
  }
};

const Action: React.FC<{ action: string; selected: boolean; pageView: PageView; }> = ({ action, selected, pageView }) => (<div className={buttonColorCalc(selected, pageView)}>{action}</div>);

const OnScreenActions: React.FC<{ selectedActionIndex: number; pageView: PageView; }> = ({ selectedActionIndex, pageView }) => (
  <div className="grid grid-cols-3 grid-rows-1">
    {pageViewActionMap[pageView].map((action, index) => (<Action action={action} key={action} selected={selectedActionIndex === index} pageView={pageView} />))}
  </div>
);

export default OnScreenActions;