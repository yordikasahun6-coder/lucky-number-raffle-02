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
    <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-6 py-5 flex items-center gap-4 mb-8">
      <div className="w-11 h-11 rounded-xl bg-[#29164F] flex items-center justify-center text-lg text-[#8B4DFF]">
        🗄️
      </div>
      <div>
        <p className="text-[#9AA7BC] text-sm mb-0.5">Screenshot storage used</p>
        {loading ? (
          <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
            Calculating...
          </p>
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#D9A63A]">
              {stats?.totalFormatted || "0 B"}
            </span>
            <span className="text-[#64748B] text-sm">
              ({stats?.fileCount || 0} file{stats?.fileCount !== 1 ? "s" : ""})
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
