import { db } from "@/lib/db";
import Fuse from "fuse.js";

let fuseInstance: Fuse<any> | null = null;

export async function getFuseIndex() {
  if (fuseInstance) return fuseInstance;

  const links = await db.links.toArray();
  fuseInstance = new Fuse(links, {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "collectionName", weight: 0.5 },
      { name: "domain", weight: 0.4 },
      { name: "url", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "metaText", weight: 0.1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    shouldSort: true,
    minMatchCharLength: 1,
  });
  return fuseInstance;
}

export async function refreshIndex() {
  fuseInstance = null;
  await getFuseIndex();
  console.log("Search index refreshed");
}

export async function searchLinks(query: string) {
  const fuse = await getFuseIndex();
  return fuse.search(query, { limit: 20 }).map((r) => r.item);
}
