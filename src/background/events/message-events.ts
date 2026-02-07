import { db } from "@/lib/db";
import {
  searchLinks,
  refreshIndex,
  getSearchMetrics,
} from "../services/search-service";
import { handleUpdateLinkSync, handleDeleteLink } from "../operations/link-ops";
import {
  handleCreateCollectionSync,
  handleDeleteCollectionSync,
  handleRenameCollectionSync,
} from "../operations/collection-ops";
import { MESSAGE_ACTIONS } from "@/constant/messages";

async function calculateStorageDetails() {
  try {
    const [collections, links] = await Promise.all([
      db.collections.toArray(),
      db.links.toArray(),
    ]);

    // Calculate actual data sizes
    const collectionsSize = JSON.stringify(collections).length;
    const linksSize = JSON.stringify(links).length;
    const dataSize = collectionsSize + linksSize;

    // Find largest link
    let largestLink = 0;
    let largestLinkField = "";
    links.forEach((link) => {
      const linkSize = JSON.stringify(link).length;
      if (linkSize > largestLink) {
        largestLink = linkSize;
        // Check which field is largest
        const screenshotSize = link.screenshotUrl?.length || 0;
        const metaTextSize = link.metaText?.length || 0;
        const descriptionSize = link.description?.length || 0;
        if (screenshotSize > metaTextSize && screenshotSize > descriptionSize) {
          largestLinkField = "screenshot";
        } else if (metaTextSize > descriptionSize) {
          largestLinkField = "metaText";
        } else {
          largestLinkField = "description";
        }
      }
    });

    // Get total extension storage (includes IndexedDB overhead, cache, etc.)
    let totalExtensionStorage = 0;
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      totalExtensionStorage = estimate.usage || 0;
    }

    return {
      dataSize,
      collectionsSize,
      linksSize,
      totalExtensionStorage,
      averagePerLink: links.length > 0 ? linksSize / links.length : 0,
      largestLink,
      largestLinkField,
    };
  } catch (error) {
    console.error("Failed to calculate storage:", error);
    return {
      dataSize: 0,
      collectionsSize: 0,
      linksSize: 0,
      totalExtensionStorage: 0,
      averagePerLink: 0,
      largestLink: 0,
      largestLinkField: "unknown",
    };
  }
}

export function initMessageEvents() {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case MESSAGE_ACTIONS.SEARCH:
        searchLinks(message.query).then((results) => sendResponse({ results }));
        return true;

      case MESSAGE_ACTIONS.REFRESH_INDEX:
        refreshIndex().then(() => sendResponse({ success: true }));
        return true;

      case MESSAGE_ACTIONS.GET_COLLECTIONS:
        db.collections
          .toArray()
          .then((collections) => sendResponse({ collections }));
        return true;

      case MESSAGE_ACTIONS.GET_LINK:
        db.links.get(message.linkId).then((link) => sendResponse({ link }));
        return true;

      case MESSAGE_ACTIONS.UPDATE_LINK_COLLECTION:
        handleUpdateLinkSync(message.linkId, message.collection).then(
          sendResponse,
        );
        return true;

      case MESSAGE_ACTIONS.DELETE_LINK:
        handleDeleteLink(message.linkId).then(sendResponse);
        return true;

      case MESSAGE_ACTIONS.CREATE_COLLECTION:
        handleCreateCollectionSync(message.id, message.name).then(sendResponse);
        return true;

      case MESSAGE_ACTIONS.DELETE_COLLECTION:
        handleDeleteCollectionSync(message.id).then(sendResponse);
        return true;

      case MESSAGE_ACTIONS.RENAME_COLLECTION:
        handleRenameCollectionSync(message.id, message.name).then(sendResponse);
        return true;

      case MESSAGE_ACTIONS.GET_STATISTICS:
        Promise.all([
          db.links.count(),
          db.collections.count(),
          calculateStorageDetails(),
        ]).then(([linksCount, collectionsCount, storageDetails]) => {
          const searchMetrics = getSearchMetrics();
          sendResponse({
            linksCount,
            collectionsCount,
            storageDetails,
            searchMetrics,
          });
        });
        return true;

      case MESSAGE_ACTIONS.EXPORT_DATA:
        Promise.all([
          db.collections.toArray(),
          db.links.toArray(),
          db.syncInfo.toArray(),
        ])
          .then(([collections, links, syncInfo]) => {
            const exportData = {
              version: 1,
              exportedAt: new Date().toISOString(),
              data: {
                collections,
                links,
                syncInfo,
              },
            };
            sendResponse({ success: true, data: exportData });
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
        return true;

      case MESSAGE_ACTIONS.IMPORT_DATA:
        (async () => {
          try {
            const { data } = message;
            if (!data || !data.data) {
              sendResponse({ success: false, error: "Invalid data format" });
              return;
            }

            const { collections, links, syncInfo } = data.data;

            // Clear existing data
            await db.transaction(
              "rw",
              [db.collections, db.links, db.syncInfo],
              async () => {
                await db.collections.clear();
                await db.links.clear();
                await db.syncInfo.clear();

                // Import new data
                if (collections?.length)
                  await db.collections.bulkAdd(collections);
                if (links?.length) await db.links.bulkAdd(links);
                if (syncInfo?.length) await db.syncInfo.bulkAdd(syncInfo);
              },
            );

            // Refresh search index
            await refreshIndex();

            sendResponse({
              success: true,
              imported: {
                collections: collections?.length || 0,
                links: links?.length || 0,
              },
            });
          } catch (error) {
            sendResponse({ success: false, error: (error as Error).message });
          }
        })();
        return true;

      default:
        return false;
    }
  });
}
