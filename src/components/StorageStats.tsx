"use client";

import { useState, useEffect } from "react";

export default function StorageStats() {
  const [stats, setStats] = useState<{
    fileCount: number;
    totalFormatted: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/storage-stats");
      const data = await res.json();
      if (res.ok) setStats(data);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded bg-[#141B29] border border-[#232D42] p-4 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[#D4A24C]/10 flex items-center justify-center text-lg">
          🗄️
        </span>
        <div>
          <p className="text-[#7C879C] text-xs">Screenshot storage used</p>
          {loading ? (
            <p className="text-[#4A5468] text-sm [font-family:var(--font-mono)]">
              Calculating...
            </p>
          ) : (
            <p className="[font-family:var(--font-mono)] text-lg font-bold text-[#D4A24C]">
              {stats?.totalFormatted || "0 B"}
              <span className="text-[#7C879C] text-xs font-normal ml-2">
                ({stats?.fileCount || 0} file{stats?.fileCount !== 1 ? "s" : ""}
                )
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
