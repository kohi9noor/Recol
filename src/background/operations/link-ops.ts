import { db } from "@/lib/db";
import { refreshIndex } from "../services/search-service";
import { openSaveDialog } from "./ui-ops";

const processingUrls = new Set<string>();

function normalizeUrl(url: string) {
  try {
    const urlObj = new URL(url);
    let normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, "");
    if (urlObj.search) normalized += urlObj.search;
    return normalized.toLowerCase();
  } catch (e) {
    return url.toLowerCase();
  }
}

export async function handleSaveCommand(activeTab: chrome.tabs.Tab) {
  if (!activeTab.id || !activeTab.url) return;

  const url = normalizeUrl(activeTab.url);
  if (
    url.startsWith("chrome://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-extension://")
  ) {
    return;
  }

  if (processingUrls.has(url)) return;
  processingUrls.add(url);

  try {
    const domain = new URL(url).hostname;

    let linkId: string;

    let existingLink = await db.links
      .where("url")
      .anyOf([url, url + "/", url.replace(/\/$/, "")])
      .first();

    if (!existingLink && activeTab.title) {
      console.log(
        `[SYNC:Search] URL mismatch, checking title: "${activeTab.title}" on ${domain}`,
      );
      existingLink = await db.links
        .where("title")
        .equalsIgnoreCase(activeTab.title)
        .and((link) => link.domain === domain)
        .first();

      if (existingLink) {
        console.log(
          `[SYNC:Dedupe] Found by title. Updating URL for existing ID: ${existingLink.id}`,
        );
        await db.links.update(existingLink.id, { url: url });
      }
    }

    if (!existingLink) {
      linkId = self.crypto.randomUUID();
      const others = await db.collections
        .where("name")
        .equalsIgnoreCase("others")
        .first();

      const newLink = {
        id: linkId,
        url: url,
        title: activeTab.title || "Untitled",
        domain,
        collectionId: others?.id || "others",
        collectionName: others?.name || "Others",
        updatedAt: Date.now(),
        description: "",
        screenshotUrl: "",
        metaText: "",
        syncStatus: "pending" as const,
      };

      await db.links.add(newLink);

      await refreshIndex();
    } else {
      linkId = existingLink.id;
    }

    openSaveDialog(activeTab.id, activeTab, linkId);
  } finally {
    processingUrls.delete(url);
  }
}

export async function handleDeleteLink(linkId: string) {
  console.log(`[LinkOp] Deleting link: ${linkId}`);
  try {
    await db.links.delete(linkId);
    await refreshIndex();
    return { success: true };
  } catch (error) {
    console.error(`[LinkOp] Failed to delete link:`, error);
    return { success: false, error: "Failed to delete" };
  }
}

export async function handleUpdateLinkSync(
  linkId: string,
  collection: { id: string; name: string },
) {
  console.log(`[LinkOp] Local update: ${linkId} -> ${collection.name}`);
  try {
    await db.links.update(linkId, {
      collectionId: collection.id,
      collectionName: collection.name,
      updatedAt: Date.now(),
      syncStatus: "pending",
    });

    await refreshIndex();
    return { success: true };
  } catch (err: any) {
    console.error(`[LinkOp] Update failed:`, err);
    return { success: false, error: err.message };
  }
}
