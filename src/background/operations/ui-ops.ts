import { BACKGROUND_EVENTS, BACKGROUND_EVENT_ACTION } from "@/constant/events";

export function openSaveDialog(
  tabId: number,
  tab: chrome.tabs.Tab,
  linkId: string,
) {
  console.log(
    `[UI:Action] Opening save dialog for link: ${linkId} on tab: ${tabId}`,
  );
  chrome.tabs
    .sendMessage(tabId, {
      action: BACKGROUND_EVENT_ACTION[BACKGROUND_EVENTS.openDialog].action,
      data: {
        ...BACKGROUND_EVENT_ACTION[BACKGROUND_EVENTS.openDialog].data(tab),
        linkId,
      },
    })
    .catch((err) =>
      console.error("[UI:Error] Failed to open save dialog:", err),
    );
}

export function toggleSearchMode(tabId: number, tab: chrome.tabs.Tab) {
  console.log(`[UI:Action] Toggling search mode on tab: ${tabId}`);
  chrome.tabs
    .sendMessage(tabId, {
      action:
        BACKGROUND_EVENT_ACTION[BACKGROUND_EVENTS.toggleSearchMode].action,
      data: BACKGROUND_EVENT_ACTION[BACKGROUND_EVENTS.toggleSearchMode].data(
        tab,
      ),
    })
    .catch((err) =>
      console.error("[UI:Error] Failed to toggle search mode:", err),
    );
}
