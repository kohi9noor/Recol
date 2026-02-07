import { handleBackgroundMessage } from "../handlers/message-handler";

export function initMessageListener() {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    handleBackgroundMessage(message, sendResponse);
    return true; // async support
  });
  console.log("[Frontend:Events] Message listener initialized");
}
