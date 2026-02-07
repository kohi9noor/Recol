import { db } from "@/lib/db";
import Fuse from "fuse.js";

let fuseInstance: Fuse<any> | null = null;
let searchMetrics = {
  totalSearches: 0,
  totalTime: 0,
  lastSearchTime: 0,
};

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
  const startTime = performance.now();
  const fuse = await getFuseIndex();
  const results = fuse.search(query, { limit: 20 }).map((r) => r.item);
  const endTime = performance.now();

  const searchTime = endTime - startTime;
  searchMetrics.totalSearches++;
  searchMetrics.totalTime += searchTime;
  searchMetrics.lastSearchTime = searchTime;

  return results;
}

export function getSearchMetrics() {
  return {
    ...searchMetrics,
    averageTime:
      searchMetrics.totalSearches > 0
        ? searchMetrics.totalTime / searchMetrics.totalSearches
        : 0,
  };
}
