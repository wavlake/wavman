import { Dispatch, SetStateAction } from "react";

export const COMMENTS_VIEW = "comments";
export const PLAYER_VIEW = "player";
export const QR_VIEW = "qr_code";
export const ZAP_VIEW = "zap";
export const SPLASH_VIEW = "splash";
export type PageView =
  | typeof COMMENTS_VIEW
  | typeof PLAYER_VIEW
  | typeof QR_VIEW
  | typeof ZAP_VIEW
  | typeof SPLASH_VIEW;
export type Actions =
  | "PLAY"
  | "PAUSE"
  | "ZAP"
  | "NEXT"
  | ">"
  | "<"
  | "CONFIRM"
  | "COMMENTS";
type ToggleViewHandler = (pageView: PageView) => void;
export type ActionHandler = () => void | ToggleViewHandler;

// will need to handle a view navigation when index is out of bounds for the next view
// (not an issue now due to same action count)
const commentViewActions: Actions[] = ["<", "PLAY", "ZAP", "NEXT"];
const pageViewActions: Actions[] = ["PLAY", "ZAP", "NEXT", ">"];
const zapViewActions: Actions[] = ["<", "CONFIRM"];
const qrViewActions: Actions[] = ["<", "COMMENTS"];
const splashViewActions: Actions[] = [];
export const pageViewActionMap: Record<PageView, Actions[]> = {
  [PLAYER_VIEW]: pageViewActions,
  [COMMENTS_VIEW]: commentViewActions,
  [QR_VIEW]: qrViewActions,
  [ZAP_VIEW]: zapViewActions,
  [SPLASH_VIEW]: splashViewActions,
};
const pageViewStartIndexMap: Record<PageView, number> = {
  [PLAYER_VIEW]: 3,
  [COMMENTS_VIEW]: 0,
  [QR_VIEW]: 0,
  [ZAP_VIEW]: 1,
  [SPLASH_VIEW]: 0,
};

export const resetSelectionOnPageChange = (
  pageView: PageView,
  setSelectedActionIndex: Dispatch<SetStateAction<number>>
): void => {
  setSelectedActionIndex(pageViewStartIndexMap[pageView]);
};
