import { db } from "@/lib/db";
import { searchLinks, refreshIndex } from "../services/search-service";
import { handleUpdateLinkSync, handleDeleteLink } from "../operations/link-ops";
import {
  handleCreateCollectionSync,
  handleDeleteCollectionSync,
  handleRenameCollectionSync,
} from "../operations/collection-ops";
import { MESSAGE_ACTIONS } from "@/constant/messages";

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

      default:
        return false;
    }
  });
}
