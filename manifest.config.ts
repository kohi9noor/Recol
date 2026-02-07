import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Recol: Instant Recall",
  description:
    "Keyboard-first bookmarking for instant save and instant recall.",
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/main.ts",
    type: "module",
  },
  permissions: ["storage", "commands", "tabs"],
  host_permissions: ["http://localhost:4000/*", "http://localhost:3000/*"],
  externally_connectable: {
    matches: ["http://localhost:3000/*"],
  },
  content_scripts: [
    {
      js: ["src/content/index.tsx"],
      matches: ["https://*/*", "http://*/*"],
      run_at: "document_idle",
    },
  ],
  commands: {
    "open-dialog": {
      suggested_key: {
        default: "Ctrl+Shift+S",
        mac: "Command+Shift+S",
      },
      description: "Open extension dialog",
    },
    "toggle-search-mode": {
      suggested_key: {
        default: "Ctrl+Shift+L",
        mac: "Command+Shift+L",
      },
      description: "Toggle search mode in the dialog",
    },
  },
});
