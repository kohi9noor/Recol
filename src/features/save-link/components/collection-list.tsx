import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Collection } from "../hooks/use-save-dialog-logic";
import { AddCollectionForm } from "./add-collection-form";

interface CollectionListProps {
  collections: Collection[];
  activeHover: Collection | null;
  onSelect: (col: Collection) => void;
  onHover: (col: Collection) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  isAdding: boolean;
  onAddToggle: (adding: boolean) => void;
  newColName: string;
  onNameChange: (name: string) => void;
  onAddSave: () => void;
  error: string | null;
  renamingId: string | null;
  onRenamingIdChange: (id: string | null) => void;
  confirmDeleteId: string | null;
  onConfirmDeleteIdChange: (id: string | null) => void;
}

export function CollectionList({
  collections,
  activeHover,
  onSelect,
  onHover,
  onDelete,
  onRename,
  isAdding,
  onAddToggle,
  newColName,
  onNameChange,
  onAddSave,
  error,
  renamingId,
  onRenamingIdChange,
  confirmDeleteId,
  onConfirmDeleteIdChange,
}: CollectionListProps) {
  const activeRef = useRef<HTMLDivElement>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    if (activeHover && activeRef.current) {
      activeRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeHover]);

  const handleRenameStart = (e: React.MouseEvent, c: Collection) => {
    e.stopPropagation();
    onRenamingIdChange(c.id);
    setRenameValue(c.name);
    setRenameError(null);
  };

  const handleRenameSave = (e?: React.MouseEvent, id?: string) => {
    e?.stopPropagation();
    const targetId = id || renamingId;
    if (!targetId) return;

    const trimmedValue = renameValue.trim();
    if (!trimmedValue) {
      setRenameError("Name cannot be empty");
      return;
    }

    const isDuplicate = collections.some(
      (c) =>
        c.name.toLowerCase() === trimmedValue.toLowerCase() &&
        c.id !== targetId,
    );

    if (isDuplicate) {
      setRenameError("Collection already exists");
      return;
    }

    onRename(targetId, trimmedValue);
    onRenamingIdChange(null);
    setRenameError(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onConfirmDeleteIdChange(id);
  };

  return (
    <div className="save-dialog-list">
      {collections.map((c) => (
        <div
          key={c.id}
          ref={activeHover?.id === c.id ? activeRef : null}
          className={`save-dialog-item-container ${activeHover?.id === c.id ? "active" : ""}`}
          onMouseEnter={() => onHover(c)}
          onClick={() => !renamingId && onSelect(c)}
        >
          {renamingId === c.id ? (
            <div className="collection-rename-container">
              <div className="collection-rename-input-container">
                <input
                  autoFocus
                  className={`collection-rename-input ${renameError ? "has-error" : ""}`}
                  value={renameValue}
                  onChange={(e) => {
                    setRenameValue(e.target.value);
                    if (renameError) setRenameError(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      handleRenameSave();
                    }
                  }}
                />
                <button
                  className="rename-action-btn save"
                  onClick={(e) => handleRenameSave(e, c.id)}
                >
                  <Check size={12} />
                </button>
                <button
                  className="rename-action-btn cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenamingIdChange(null);
                  }}
                >
                  <X size={12} />
                </button>
              </div>
              {renameError && (
                <div className="collection-rename-error">{renameError}</div>
              )}
            </div>
          ) : (
            <>
              <span className="collection-name">{c.name}</span>
              <div className="collection-item-actions">
                <button
                  className="collection-action-btn rename"
                  onClick={(e) => handleRenameStart(e, c)}
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="collection-action-btn delete"
                  onClick={(e) => handleDeleteClick(e, c.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </>
          )}

          {confirmDeleteId === c.id && (
            <div
              className="delete-confirmation-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-confirmation-content">
                <p>
                  Delete <b>{c.name}</b> and its links?
                </p>
                <div className="delete-confirmation-actions">
                  <button
                    className="confirm-btn"
                    onClick={() => {
                      onDelete(c.id);
                      onConfirmDeleteIdChange(null);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => onConfirmDeleteIdChange(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {isAdding ? (
        <AddCollectionForm
          value={newColName}
          onChange={onNameChange}
          onSave={onAddSave}
          onCancel={() => onAddToggle(false)}
          error={error}
        />
      ) : (
        <button
          className="save-dialog-add-toggle"
          onClick={() => onAddToggle(true)}
        >
          <Plus size={14} />
          <span>Add collection</span>
        </button>
      )}
      {collections.length === 0 && !isAdding && (
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "var(--foreground-muted)",
          }}
        >
          No collections found
        </div>
      )}
    </div>
  );
}
