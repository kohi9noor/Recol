import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/types";
import Result from "./result";
import { MESSAGE_ACTIONS } from "@/constant/messages";

interface SearchProps {
  open: boolean;
  onClose: () => void;
}

const Search = ({ open, onClose }: SearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  function safeSetIndx(index: number) {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  function deleteLink(linkId: string) {
    chrome.runtime.sendMessage(
      { action: MESSAGE_ACTIONS.DELETE_LINK, linkId },
      (response) => {
        if (response?.success) {
          setResults((prev) => {
            const newResults = prev.filter((r) => r.id !== linkId);
            if (
              activeIndexRef.current >= newResults.length &&
              newResults.length > 0
            ) {
              safeSetIndx(newResults.length - 1);
            }
            return newResults;
          });
        }
      },
    );
  }

  useEffect(() => {
    activeIndexRef.current = 0;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.SEARCH, query },
        (response) => {
          if (response?.results) {
            setResults(response.results);
          }
        },
      );
    }, 50);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const displayedResults = results.slice(0, 10);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const path = e.composedPath();
      const isInside = path.some(
        (target) =>
          target instanceof HTMLElement && target.closest(".extension-popup"),
      );
      if (!isInside) {
        e.stopImmediatePropagation();
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const path = e.composedPath();
      const isFromUs = path.some(
        (target) =>
          target instanceof HTMLElement && target.closest(".extension-popup"),
      );
      if (!isFromUs) return;

      if (
        [
          "Escape",
          "ArrowDown",
          "ArrowUp",
          "Enter",
          "Backspace",
          "Delete",
        ].includes(e.key)
      ) {
        e.stopImmediatePropagation();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        if (displayedResults.length === 0) return;
        e.preventDefault();
        const next = (activeIndexRef.current + 1) % displayedResults.length;
        safeSetIndx(next);
        return;
      }

      if (e.key === "ArrowUp") {
        if (displayedResults.length === 0) return;
        e.preventDefault();
        const next =
          (activeIndexRef.current - 1 + displayedResults.length) %
          displayedResults.length;
        safeSetIndx(next);
        return;
      }

      if (e.key === "Enter") {
        if (displayedResults.length === 0) return;
        e.preventDefault();
        const selected = displayedResults[activeIndexRef.current];
        if (selected) {
          window.open(selected.url, "_blank");
          onClose();
        }
        return;
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "Backspace" || e.key === "Delete")
      ) {
        if (displayedResults.length === 0) return;
        e.preventDefault();
        const selected = displayedResults[activeIndexRef.current];
        if (selected) {
          deleteLink(selected.id);
        }
        return;
      }
    };

    if (open) {
      window.addEventListener("mousedown", handleMouseDown, true);
      window.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, onClose, displayedResults.length]);

  useEffect(() => {
    safeSetIndx(0);
  }, [query]);

  if (!open) return null;

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    setQuery(e.target.value);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Stop character keys ('k', 'f', etc.) from bubbling out to host sites like YouTube
    if (e.key.length === 1) {
      e.stopPropagation();
    }

    // System keys are handled by the global window capture listener
  }

  return (
    <div className="extension-popup p-2 rounded-xl">
      <input
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleInputKeyDown}
        autoFocus
      />

      <Result
        results={displayedResults}
        onClose={onClose}
        onDelete={deleteLink}
        activeIndex={activeIndex}
      />
    </div>
  );
};

export default Search;
