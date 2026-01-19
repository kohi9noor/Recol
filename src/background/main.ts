import { initCommandEvents } from "./events/command-events";
import { initMessageEvents } from "./events/message-events";
import { getFuseIndex } from "./services/search-service";

initCommandEvents();
initMessageEvents();
getFuseIndex();
console.log("Background script initialized");
