import { useState, useCallback } from "react";
import { useExtensionEvents } from "@/features/shared/hooks/use-events";
import { FloatingButton } from "./features/widget/floating-button";
import { SearchFeature } from "./features/search/search-feature";
import { SaveLinkFeature } from "./features/save-link/save-link-feature";

export default function App() {
  const [activeFeature, setActiveFeature] = useState<
    "none" | "search" | "save" | "auth"
  >("none");
  const [saveData, setSaveData] = useState<{ linkId?: string; error?: string }>(
    {},
  );

  const handleToggleDialog = useCallback((data?: { linkId?: string }) => {
    if (data?.linkId) {
      setSaveData(data);
      setActiveFeature("save");
    } else {
      setActiveFeature((prev) => (prev === "save" ? "none" : "save"));
    }
  }, []);

  const handleToggleSearch = useCallback(() => {
    setActiveFeature((prev) => (prev === "search" ? "none" : "search"));
  }, []);

  const handleEscape = useCallback(() => {
    setActiveFeature("none");
  }, []);

  useExtensionEvents({
    onToggleDialog: handleToggleDialog,
    onToggleSearch: handleToggleSearch,
    onEscape: handleEscape,
  });

  const isAnyModalOpen = activeFeature !== "none";

  return (
    <>
      <FloatingButton
        show={!isAnyModalOpen}
        onClick={() => setActiveFeature("search")}
      />

      <SearchFeature
        isOpen={activeFeature === "search"}
        onClose={() => setActiveFeature("none")}
      />

      <SaveLinkFeature
        isOpen={activeFeature === "save"}
        linkId={saveData.linkId}
        error={saveData.error}
        onClose={() => setActiveFeature("none")}
      />
    </>
  );
}
