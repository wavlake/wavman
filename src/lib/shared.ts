import { Dispatch, SetStateAction } from "react";

export const COMMENTS_VIEW = "comments";
export const PLAYER_VIEW = "player";
export const QR_VIEW = "qr_code";
export const ZAP_AMOUNT_VIEW = "zap_amount";
export const ZAP_COMMENT_VIEW = "zap_comment";
export const SPLASH_VIEW = "splash";
export type PageView =
  | typeof COMMENTS_VIEW
  | typeof PLAYER_VIEW
  | typeof QR_VIEW
  | typeof ZAP_AMOUNT_VIEW
  | typeof ZAP_COMMENT_VIEW
  | typeof SPLASH_VIEW;
export type Actions =
  | "PLAY"
  | "PAUSE"
  | "ZAP"
  | "NEXT"
  | ">"
  | "<"
  | "CONFIRM_COMMENT"
  | "CONFIRM_AMOUNT"
  | "COMMENTS";
type ToggleViewHandler = (pageView: PageView) => void;
export type ActionHandler = () => void | ToggleViewHandler;

// will need to handle a view navigation when index is out of bounds for the next view
// (not an issue now due to same action count)
const commentViewActions: Actions[] = ["<"];
const pageViewActions: Actions[] = ["PLAY", "ZAP", "NEXT", ">"];
const zapAmountViewActions: Actions[] = ["<", "CONFIRM_AMOUNT"];
const zapCommentViewActions: Actions[] = ["<", "CONFIRM_COMMENT"];
const qrViewActions: Actions[] = ["<"];
const splashViewActions: Actions[] = [];
type PageViewActionMap = Record<PageView, Actions[]>;
export const pageViewActionMap: PageViewActionMap = {
  [PLAYER_VIEW]: pageViewActions,
  [COMMENTS_VIEW]: commentViewActions,
  [QR_VIEW]: qrViewActions,
  [ZAP_AMOUNT_VIEW]: zapAmountViewActions,
  [ZAP_COMMENT_VIEW]: zapCommentViewActions,
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
  [ZAP_AMOUNT_VIEW]: 1,
  [ZAP_COMMENT_VIEW]: 1,
  [SPLASH_VIEW]: 0,
};

export const getPageActions = (currentPage: PageView) => {
  const actions = pageViewActionMap[currentPage];
  if (!actions) {
    console.log("no actions found for page", { currentPage });
    return [];
  }
  return actions;
};

// initially used to filter ZAP from action menu when not logged in
// not needed due to anon zaps
export const getFilteredPageActions = (
  currentPage: PageView,
  actionToFilter: Actions,
  publicKey?: string
) =>
  pageViewActionMap[currentPage]?.filter((action) =>
    publicKey ? true : action !== actionToFilter
  );
export const resetSelectionOnPageChange = (
  pageView: PageView,
  setSelectedActionIndex: Dispatch<SetStateAction<number>>
): void => {
  setSelectedActionIndex(pageViewStartIndexMap[pageView]);
};

export const coerceEnvVarToBool = (envVar: string | undefined): boolean => {
  if (!envVar) return false;
  return envVar === "true";
};
