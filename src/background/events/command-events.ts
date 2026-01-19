import { BACKGROUND_EVENTS } from "@/constant/events";
import { handleSaveCommand } from "../operations/link-ops";
import { toggleSearchMode } from "../operations/ui-ops";

export function initCommandEvents() {
  chrome.commands.onCommand.addListener(async (command) => {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) return;

    switch (command) {
      case BACKGROUND_EVENTS.openDialog: {
        await handleSaveCommand(activeTab);
        break;
      }
      case BACKGROUND_EVENTS.toggleSearchMode:
        toggleSearchMode(activeTab.id, activeTab);
        break;
      default:
        console.warn(`[Events:Command] Unhandled command: ${command}`);
    }
  });
}
