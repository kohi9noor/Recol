import { BACKGROUND_EVENTS, BACKGROUND_EVENT_ACTION } from "@/constant/events";

export function initMessageListener() {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    console.log("[Content:Service] Message received:", message.action);

    const events = [
      BACKGROUND_EVENTS.openDialog,
      BACKGROUND_EVENTS.toggleSearchMode,
      BACKGROUND_EVENTS.openAuthTab,
      BACKGROUND_EVENTS.showUpgradePrompt,
    ];

    for (const eventKey of events) {
      const eventAction = BACKGROUND_EVENT_ACTION[eventKey];
      if (message.action === eventAction.action) {
        window.dispatchEvent(
          new CustomEvent(eventAction.clientEvent, { detail: message }),
        );
        sendResponse({ success: true, action: message.action });
        return true;
      }
    }

    return true;
  });
}
