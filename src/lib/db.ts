import Dexie from "dexie";
export type SyncStatus = "synced" | "pending" | "error";

export interface Collection {
  id: string;
  name: string;
  updatedAt: number;
  syncStatus?: SyncStatus;
  lastError?: string;
}

export interface Link {
  id: string;
  url: string;
  title: string | null;
  domain: string | null;
  description: string | null;
  screenshotUrl: string | null;
  metaText: string | null;
  collectionId: string;
  collectionName: string;
  updatedAt: number;
  syncStatus?: SyncStatus;
  lastError?: string;
}

export class RecolDatabase extends Dexie {
  collections!: Dexie.Table<Collection, string>;
  links!: Dexie.Table<Link, string>;
  syncInfo!: Dexie.Table<{ id: number; lastSyncedAt: number }, number>;

  constructor() {
    super("RecolDatabase");
    this.version(2).stores({
      collections: "id, name, syncStatus",
      links: "id, url, title, collectionId, syncStatus",
      syncInfo: "id",
    });
  }
}

export const db = new RecolDatabase();
