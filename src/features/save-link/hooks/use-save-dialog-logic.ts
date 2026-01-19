import { useState, useEffect, useCallback } from "react";
import { MESSAGE_ACTIONS, ERROR_CODES } from "@/constant/messages";

export type Collection = {
  id: string;
  name: string;
};

export function useSaveDialogLogic(
  open: boolean,
  linkId?: string,
  onClose?: () => void,
  initialError?: string,
) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeHover, setActiveHover] = useState<Collection | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [error, setError] = useState<string | null>(initialError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCollection, setSearchCollection] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.GET_COLLECTIONS,
      });
      if (response?.collections) {
        setCollections(response.collections);
        return response.collections;
      }
    } catch (err) {}
    return [];
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsAdding(false);
      setNewColName("");
      setRenamingId(null);
      setConfirmDeleteId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!isAdding) {
      setError(null);
      setNewColName("");
    }
  }, [isAdding]);
  useEffect(() => {
    if (!open) return;
    const init = async () => {
      setIsLoading(true);
      setCollections(
        searchCollection
          ? collections.filter((col) =>
              col.name.toLowerCase().includes(searchCollection.toLowerCase()),
            )
          : await fetchCollections(),
      );
    };
    init();
  }, [searchCollection]);
  useEffect(() => {
    if (open) {
      const init = async () => {
        setIsLoading(true);
        const cols = await fetchCollections();

        let defaultCol: Collection | null = null;
        if (linkId) {
          const { link } = await chrome.runtime.sendMessage({
            action: MESSAGE_ACTIONS.GET_LINK,
            linkId,
          });
          if (link) {
            defaultCol =
              cols.find((c: Collection) => c.id === link.collectionId) || null;
          }
        }

        if (!defaultCol && cols.length > 0) {
          defaultCol =
            cols.find((c: Collection) => c.name.toLowerCase() === "others") ||
            cols[0];
        }
        setActiveHover(defaultCol);
        setIsLoading(false);
      };
      init();
    }
  }, [open, linkId, fetchCollections]);

  const handleSelect = async (collection: Collection) => {
    if (!linkId) {
      onClose?.();
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.UPDATE_LINK_COLLECTION,
        linkId,
        collection,
      });

      if (response?.success) {
        console.log("[UI:Logic] Successfully updated link collection");
      } else {
        console.error(
          "[UI:Logic] Failed to update link collection:",
          response?.error,
        );
      }
    } catch (err) {
      console.error("[UI:Logic] Error during selection:", err);
    } finally {
      onClose?.();
    }
  };

  const handleAddCollection = async () => {
    const trimmed = newColName.trim();
    if (!trimmed) return;

    if (
      collections.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError("Name already exists");
      return;
    }

    try {
      setError(null);
      const id = self.crypto.randomUUID();
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.CREATE_COLLECTION,
        id,
        name: trimmed,
      });

      if (response?.success) {
        await fetchCollections();
        setNewColName("");
        setIsAdding(false);
      } else {
        if (response?.error === ERROR_CODES.LIMIT_REACHED) {
          setError(ERROR_CODES.SUBSCRIPTION_REQUIRED);
        } else if (response?.error === ERROR_CODES.DEVICE_LIMIT_REACHED) {
          setError(ERROR_CODES.DEVICE_LIMIT_REACHED);
        } else {
          setError(response?.error || "Failed to create collection");
        }
      }
    } catch (err) {
      console.error("[UI:Logic] Error adding collection:", err);
      setError("Sync error");
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.DELETE_COLLECTION,
        id,
      });
      if (response?.success) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        if (activeHover?.id === id) setActiveHover(null);
      }
    } catch (err) {
      setError("Failed to delete collection");
    }
  };

  const handleRenameCollection = async (id: string, name: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.RENAME_COLLECTION,
        id,
        name,
      });
      if (response?.success) {
        setCollections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name } : c)),
        );
      }
    } catch (err) {
      setError("Failed to rename collection");
    }
  };

  const moveSelection = (direction: "up" | "down") => {
    if (isAdding || collections.length === 0) return;
    setActiveHover((prev) => {
      if (!prev) return collections[0];
      const currentIndex = collections.findIndex((c) => c.id === prev.id);
      if (direction === "up") {
        const nextIndex =
          currentIndex - 1 < 0 ? collections.length - 1 : currentIndex - 1;
        return collections[nextIndex];
      } else {
        const nextIndex = (currentIndex + 1) % collections.length;
        return collections[nextIndex];
      }
    });
  };

  return {
    collections,
    activeHover,
    setActiveHover,
    isAdding,
    setIsAdding,
    newColName,
    setNewColName,
    error,
    setError,
    isLoading,
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
  };
}
