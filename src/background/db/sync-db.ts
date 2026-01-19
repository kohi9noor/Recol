import { db } from "@/lib/db";

const syncDB = async (changes: any, serverTime: number) => {
  return await db.transaction(
    "rw",
    [db.collections, db.links, db.syncInfo],
    async () => {
      if (changes.collections.upsert.length) {
        await db.collections.bulkPut(changes.collections.upsert);
      }
      if (changes.links.upsert.length) {
        await db.links.bulkPut(changes.links.upsert);
      }
      if (changes.collections.deleted.length) {
        await db.collections.bulkDelete(changes.collections.deleted);
      }
      if (changes.links.deleted.length) {
        await db.links.bulkDelete(changes.links.deleted);
      }
      await db.syncInfo.put({
        id: 1,
        lastSyncedAt: serverTime,
      });
    },
  );
};

export default syncDB;
