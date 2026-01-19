import { MESSAGE_ACTIONS } from "./messages";

export const BACKGROUND_EVENTS = {
  openDialog: "open-dialog",
  toggleSearchMode: "toggle-search-mode",
  openAuthTab: "open-auth-tab",
  showUpgradePrompt: "show-upgrade-prompt",
};

export const UI_EVENTS = {
  TOGGLE_DIALOG: "recol-toggle-dialog",
  TOGGLE_SEARCH_MODE: "recol-toggle-search-mode",
  OPEN_AUTH_TAB: "recol-open-auth-tab",
  SHOW_UPGRADE_PROMPT: "recol-show-upgrade-prompt",
};

export const BACKGROUND_EVENT_ACTION = {
  [BACKGROUND_EVENTS.openDialog]: {
    action: MESSAGE_ACTIONS.TOGGLE_DIALOG,
    data: (tab: chrome.tabs.Tab) => ({ activeUrl: tab.url, title: tab.title }),
    clientEvent: UI_EVENTS.TOGGLE_DIALOG,
  },
  [BACKGROUND_EVENTS.toggleSearchMode]: {
    action: MESSAGE_ACTIONS.TOGGLE_SEARCH_MODE,
    data: () => ({}),
    clientEvent: UI_EVENTS.TOGGLE_SEARCH_MODE,
  },

  [BACKGROUND_EVENTS.openAuthTab]: {
    action: MESSAGE_ACTIONS.OPEN_AUTH_TAB,
    data: () => ({}),
    clientEvent: UI_EVENTS.OPEN_AUTH_TAB,
  },

  [BACKGROUND_EVENTS.showUpgradePrompt]: {
    action: MESSAGE_ACTIONS.SHOW_UPGRADE_PROMPT,
    data: () => ({}),
    clientEvent: UI_EVENTS.SHOW_UPGRADE_PROMPT,
  },
};
