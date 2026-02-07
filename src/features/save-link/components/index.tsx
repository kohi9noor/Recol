import { useEffect } from "react";
import { useSaveDialogLogic } from "../hooks/use-save-dialog-logic";
import { CollectionList } from "./collection-list";

interface SaveDialogProps {
  open: boolean;
  linkId?: string;
  initialError?: string;
  onClose: () => void;
}

export function SaveDialog({
  open,
  linkId,
  initialError,
  onClose,
}: SaveDialogProps) {
  const {
    collections,
    activeHover,
    setActiveHover,
    isAdding,
    setIsAdding,
    newColName,
    setNewColName,
    error,
    setError,
    handleSelect,
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
    moveSelection,
    searchCollection,
    setSearchCollection,
    renamingId,
    setRenamingId,
    confirmDeleteId,
    setConfirmDeleteId,
  } = useSaveDialogLogic(open, linkId, onClose, initialError);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const path = e.composedPath();
      const target = (path[0] || e.target) as HTMLElement;
      const isFromUs = path.some(
        (t) =>
          t instanceof HTMLElement &&
          (t.closest(".save-dialog") ||
            t.classList.contains("save-dialog-overlay")),
      );

      if (!isFromUs) return;

      const isRenameInput = target.classList.contains(
        "collection-rename-input",
      );
      const isAddInput = target.classList.contains("save-dialog-add-input");
      const isSecondaryInput = isRenameInput || isAddInput;

      /**
       *  Allow Enter key in rename/add input without triggering global actions like moving selection or closing dialog
       *  this is important for user experience as it lets users quickly rename collections or add new ones without extra clicks
       */
      if (isSecondaryInput && e.key === "Enter") {
        return;
      }

      if (["Escape", "ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
        e.stopImmediatePropagation();
      }

      if (e.key === "Escape") {
        e.preventDefault();

        if (confirmDeleteId) {
          setConfirmDeleteId(null);
          return;
        }
        if (renamingId) {
          setRenamingId(null);
          return;
        }
        if (isAdding) {
          setIsAdding(false);
          return;
        }
        if (error) {
          setError(null);
          return;
        }
        onClose();
        return;
      }

      if (isSecondaryInput) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeHover) {
          handleSelect(activeHover);
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection("up");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection("down");
        return;
      }
    };

    const handleMousedown = (e: MouseEvent) => {
      e.stopImmediatePropagation();
      const path = e.composedPath();
      const isInside = path.some(
        (target) =>
          target instanceof HTMLElement && target.closest(".save-dialog"),
      );
      if (!isInside) onClose();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mousedown", handleMousedown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mousedown", handleMousedown, true);
    };
  }, [
    open,
    isAdding,
    activeHover,
    moveSelection,
    handleAddCollection,
    handleSelect,
    onClose,
    setIsAdding,
    confirmDeleteId,
    setConfirmDeleteId,
    renamingId,
    setRenamingId,
    error,
    setError,
  ]);

  if (!open) return null;

  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog">
        <>
          <div className="save-dialog-header">
            <input
              className="collection-search-input"
              placeholder="search collection"
              value={searchCollection}
              onChange={(e) => setSearchCollection(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                backgroundColor: "var(--background-secondary)",
                color: "var(--foreground)",
                outline: "none",
                boxSizing: "border-box",
              }}
              autoFocus
            />
          </div>

          <CollectionList
            collections={collections}
            activeHover={activeHover}
            onSelect={handleSelect}
            onHover={setActiveHover}
            onDelete={handleDeleteCollection}
            onRename={handleRenameCollection}
            isAdding={isAdding}
            onAddToggle={setIsAdding}
            newColName={newColName}
            onNameChange={(val: string) => {
              setNewColName(val);
              if (error) setError(null);
            }}
            onAddSave={handleAddCollection}
            error={error}
            renamingId={renamingId}
            onRenamingIdChange={setRenamingId}
            confirmDeleteId={confirmDeleteId}
            onConfirmDeleteIdChange={setConfirmDeleteId}
          />

          <div className="save-dialog-footer">
            <button className="save-dialog-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      </div>
    </div>
  );
}
