import { useEffect, useState } from "react";
import { MESSAGE_ACTIONS } from "@/constant/messages";

interface Statistics {
  linksCount: number;
  collectionsCount: number;
  storageDetails: {
    dataSize: number;
    collectionsSize: number;
    linksSize: number;
    totalExtensionStorage: number;
    averagePerLink: number;
    largestLink: number;
    largestLinkField: string;
  };
  searchMetrics: {
    totalSearches: number;
    totalTime: number;
    lastSearchTime: number;
    averageTime: number;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatTime(ms: number): string {
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function App() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadStatistics();

    const interval = setInterval(loadStatistics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadStatistics = () => {
    chrome.runtime.sendMessage(
      { action: MESSAGE_ACTIONS.GET_STATISTICS },
      (response) => {
        if (response) {
          setStats(response);
          setLoading(false);
        }
      },
    );
  };

  const handleExport = () => {
    setExporting(true);
    chrome.runtime.sendMessage(
      { action: MESSAGE_ACTIONS.EXPORT_DATA },
      (response) => {
        setExporting(false);
        if (response?.success) {
          const dataStr = JSON.stringify(response.data, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `recol-backup-${new Date().toISOString().split("T")[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setMessage({ type: "success", text: "Data exported successfully!" });
        } else {
          setMessage({
            type: "error",
            text: "Export failed: " + (response?.error || "Unknown error"),
          });
        }
      },
    );
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          chrome.runtime.sendMessage(
            { action: MESSAGE_ACTIONS.IMPORT_DATA, data },
            (response) => {
              setImporting(false);
              if (response?.success) {
                setMessage({
                  type: "success",
                  text: `Imported ${response.imported.links} links, ${response.imported.collections} collections`,
                });
                loadStatistics();
              } else {
                setMessage({
                  type: "error",
                  text:
                    "Import failed: " + (response?.error || "Unknown error"),
                });
              }
            },
          );
        } catch (error) {
          setImporting(false);
          setMessage({ type: "error", text: "Invalid JSON file" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="w-80 p-6 bg-background text-foreground">
        <div className="flex items-center justify-center">
          <div className="text-sm text-foreground/60">
            Loading statistics...
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-80 p-6 bg-background text-foreground">
        <div className="text-sm text-foreground/60">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background text-foreground">
      <div className="p-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Recol Stats
            </h1>
            <p className="text-xs text-foreground/50">Instant Recall</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Data Management
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="py-2.5 px-4 rounded-lg bg-secondary/30 border border-border-subtle hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs text-foreground/80 font-medium"
            >
              {exporting ? "Exporting..." : "Export Data"}
            </button>

            <button
              onClick={handleImport}
              disabled={importing}
              className="py-2.5 px-4 rounded-lg bg-secondary/30 border border-border-subtle hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs text-foreground/80 font-medium"
            >
              {importing ? "Importing..." : "Import Data"}
            </button>
          </div>

          <p className="text-[10px] text-foreground/40 text-center">
            Backup your links and collections as JSON
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-foreground/5 border-foreground/20 text-foreground/80"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <p className="text-xs text-center">{message.text}</p>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Database
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border-subtle">
              <div className="text-2xl font-bold text-foreground">
                {stats.linksCount}
              </div>
              <div className="text-xs text-foreground/60 mt-1">Total Links</div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border-subtle">
              <div className="text-2xl font-bold text-foreground">
                {stats.collectionsCount}
              </div>
              <div className="text-xs text-foreground/60 mt-1">Collections</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border-subtle space-y-2">
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold text-foreground">
                  {formatBytes(stats.storageDetails.dataSize)}
                </div>
              </div>
              <div className="text-xs text-foreground/60">Actual Data Size</div>
            </div>

            <div className="pt-2 border-t border-border-subtle/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/50">Links data</span>
                <span className="text-foreground/70 font-medium">
                  {formatBytes(stats.storageDetails.linksSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/50">Collections</span>
                <span className="text-foreground/70 font-medium">
                  {formatBytes(stats.storageDetails.collectionsSize)}
                </span>
              </div>
              {stats.linksCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground/50">Avg per link</span>
                  <span className="text-foreground/70 font-medium">
                    {formatBytes(stats.storageDetails.averagePerLink)}
                  </span>
                </div>
              )}
              {stats.storageDetails.largestLink > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground/50">Largest link</span>
                  <span className="text-foreground/70 font-medium">
                    {formatBytes(stats.storageDetails.largestLink)}
                  </span>
                </div>
              )}
            </div>

            {stats.storageDetails.totalExtensionStorage > 0 && (
              <div className="pt-2 border-t border-border-subtle/50">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/40">Total ext. storage</span>
                  <span className="text-foreground/50">
                    {formatBytes(stats.storageDetails.totalExtensionStorage)}
                  </span>
                </div>
                <p className="text-[10px] text-foreground/30 mt-1">
                  Includes IndexedDB overhead + cache
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Search Performance
          </h2>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border-subtle space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground/60">Total Searches</span>
              <span className="text-sm font-semibold text-foreground">
                {stats.searchMetrics.totalSearches}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground/60">Average Time</span>
              <span className="text-sm font-semibold text-foreground">
                {formatTime(stats.searchMetrics.averageTime)}
              </span>
            </div>

            {stats.searchMetrics.lastSearchTime > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/60">Last Search</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatTime(stats.searchMetrics.lastSearchTime)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
              <span className="text-xs text-foreground/60">Total Time</span>
              <span className="text-xs text-foreground/50">
                {formatTime(stats.searchMetrics.totalTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-foreground/5 border border-foreground/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse"></div>
            <span className="text-xs text-foreground/70">
              {stats.searchMetrics.averageTime < 10
                ? "⚡ Lightning fast searches"
                : stats.searchMetrics.averageTime < 50
                  ? "✓ Good performance"
                  : "⚠️ Consider optimizing database"}
            </span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-foreground/40">
            Stats update every 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
