import { db } from "@/lib/db";
import { refreshIndex } from "../services/search-service";

export async function handleCreateCollectionSync(id: string, name: string) {
  try {
    await db.collections.add({
      id,
      name,
      updatedAt: Date.now(),
      syncStatus: "pending",
    });

    await refreshIndex();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleDeleteCollectionSync(id: string) {
  try {
    await db.transaction("rw", db.collections, db.links, async () => {
      // Delete all links in this collection
      await db.links.where("collectionId").equals(id).delete();
      // Delete the collection itself
      await db.collections.delete(id);
    });

    await refreshIndex();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleRenameCollectionSync(id: string, newName: string) {
  try {
    await db.transaction("rw", db.collections, db.links, async () => {
      await db.collections.update(id, {
        name: newName,
        updatedAt: Date.now(),
        syncStatus: "pending",
      });

      // Also update collectionName in all links for search performance consistency
      await db.links
        .where("collectionId")
        .equals(id)
        .modify({ collectionName: newName });
    });

    await refreshIndex();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
