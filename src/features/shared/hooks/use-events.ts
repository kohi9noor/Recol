import { useEffect } from "react";
import { UI_EVENTS } from "@/constant/events";

interface EventHandlers {
  onToggleDialog: (data?: any) => void;
  onToggleSearch: (data?: any) => void;
  onEscape: () => void;
}

export function useExtensionEvents({
  onToggleDialog,
  onToggleSearch,
  onEscape,
}: EventHandlers) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };

    const handleToggleDialog = (e: Event) => {
      onToggleDialog((e as CustomEvent).detail?.data);
    };

    const handleToggleSearch = (e: Event) => {
      onToggleSearch((e as CustomEvent).detail?.data);
    };

    window.addEventListener(UI_EVENTS.TOGGLE_DIALOG, handleToggleDialog);

    window.addEventListener(UI_EVENTS.TOGGLE_SEARCH_MODE, handleToggleSearch);

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener(UI_EVENTS.TOGGLE_DIALOG, handleToggleDialog);
      window.removeEventListener(
        UI_EVENTS.TOGGLE_SEARCH_MODE,
        handleToggleSearch,
      );

      window.removeEventListener("keydown", handleEsc);
    };
  }, [onToggleDialog, onToggleSearch, onEscape]);
}
