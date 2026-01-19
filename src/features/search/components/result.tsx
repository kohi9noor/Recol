import { useEffect, useRef } from "react";
import type { SearchResult } from "@/types";

interface ResultProps {
  results: SearchResult[];
  onClose: () => void;
  onDelete: (id: string) => void;
  activeIndex: number;
}

const Result = ({ results, onClose, onDelete, activeIndex }: ResultProps) => {
  const hasMore = results.length > 10;
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-white/40 text-sm font-medium">
        No results found
      </div>
    );
  }

  console.log("Rendering results:", results);

  return (
    <div className="search-results ">
      <div className="flex flex-col">
        {results.map((result, index) => (
          <Item
            active={index === activeIndex}
            activeRef={index === activeIndex ? activeItemRef : null}
            key={result.id}
            result={result}
            onClose={onClose}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div
          style={{
            padding: "10px 16px",
            fontSize: "12px",
            color: "var(--foreground-muted)",
            textAlign: "center",
            borderTop: "1px solid var(--border)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            fontStyle: "italic",
          }}
        >
          +{results.length - 10} more results found...
        </div>
      )}
    </div>
  );
};

function Item({
  result,
  onClose,
  onDelete,
  active,
  activeRef,
}: {
  result: SearchResult;
  onClose: () => void;
  onDelete: (id: string) => void;
  active: boolean;
  activeRef: React.RefObject<HTMLDivElement | null> | null;
}) {
  return (
    <div
      key={result.id}
      ref={activeRef}
      onClick={() => {
        window.open(result.url, "_blank");
        onClose();
      }}
      className={`search-result-item ${active ? "active" : ""}`}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "var(--foreground)",
            fontWeight: 600,
            fontSize: "15px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {result.title}
        </div>
        {result.collectionName && (
          <span className="collection-tag">{result.collectionName}</span>
        )}
        <div className="search-result-actions">
          <button
            className="delete-btn"
            title="Delete (Cmd+Backsp)"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(result.id);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <div
        style={{
          color: "var(--foreground-muted)",
          fontSize: "12px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {result.url}
      </div>
    </div>
  );
}

export default Result;
