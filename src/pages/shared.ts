export const COMMENTS_VIEW = 'comments';
export const PLAYER_VIEW = 'player';
export const ZAP_VIEW = 'zap';
export const SPLASH_VIEW = 'splash';
export type PageView = typeof COMMENTS_VIEW | typeof PLAYER_VIEW | typeof ZAP_VIEW | typeof SPLASH_VIEW;
export type Actions = "PLAY" | "PAUSE" | "ZAP" | "SKIP" | ">" | "<";

// will need to handle a view navigation when index is out of bounds for the next view
// (not an issue now due to same action count)
const commentViewActions: Actions[] = ["<", "PLAY", "ZAP", "SKIP"];
const pageViewActions: Actions[] = ["PLAY", "ZAP", "SKIP", ">"];
const zapViewActions: Actions[] = [];
const splashViewActions: Actions[] = [];
export const pageViewActionMap: Record<PageView, Actions[]> = {
  [PLAYER_VIEW]: pageViewActions,
  [COMMENTS_VIEW]: commentViewActions,
  [ZAP_VIEW]: zapViewActions,
  [SPLASH_VIEW]: splashViewActions,
};