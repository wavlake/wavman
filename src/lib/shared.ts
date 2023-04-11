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
type PageViewActionMap = Record<PageView, Actions[]>;
export const pageViewActionMap: PageViewActionMap = {
  [PLAYER_VIEW]: pageViewActions,
  [COMMENTS_VIEW]: commentViewActions,
  [QR_VIEW]: qrViewActions,
  [ZAP_VIEW]: zapViewActions,
  [SPLASH_VIEW]: splashViewActions,
};
// need to implement this based on the available actions
// actions can change based on if nip07 is available or not
// cant hardcode indexes, better to use ACTION enums
// and find index of the action within resetSelectionOnPageChange
const pageViewStartIndexMap: Record<PageView, number> = {
  [PLAYER_VIEW]: 0,
  [COMMENTS_VIEW]: 0,
  [QR_VIEW]: 0,
  [ZAP_VIEW]: 0,
  [SPLASH_VIEW]: 0,
};
export const removeZapIfNotLoggedIn = (
  currentPage: PageView,
  actionToFilter: Actions,
  publicKey?: string
) => pageViewActionMap[currentPage]?.filter(action => publicKey ? true : action !== actionToFilter);
export const resetSelectionOnPageChange = (
  pageView: PageView,
  setSelectedActionIndex: Dispatch<SetStateAction<number>>
): void => {
  setSelectedActionIndex(pageViewStartIndexMap[pageView]);
};
