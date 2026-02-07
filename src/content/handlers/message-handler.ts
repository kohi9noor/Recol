import { BACKGROUND_EVENTS, BACKGROUND_EVENT_ACTION } from "@/constant/events";

export function handleBackgroundMessage(message: any, sendResponse: (response?: any) => void) {
  console.log(`[Frontend:Handler] Processing background message: ${message.action}`);

  const events = [
    BACKGROUND_EVENTS.openDialog,
    BACKGROUND_EVENTS.toggleSearchMode,
    BACKGROUND_EVENTS.openAuthTab,
  ];

  for (const eventKey of events) {
    const eventAction = BACKGROUND_EVENT_ACTION[eventKey];
    if (message.action === eventAction.action) {
      window.dispatchEvent(
        new CustomEvent(eventAction.clientEvent, { detail: message })
      );
      sendResponse({ success: true, action: message.action });
      return;
    }
  }
}
