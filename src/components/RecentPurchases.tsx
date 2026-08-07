"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Entry = { number: number; maskedPhone: string; assignedAt: string };

function timeAgo(dateString: string, t: (k: any) => string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );

  if (seconds < 60) return t("justNow") || "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? t("minuteAgo") || "minute ago" : t("minutesAgo") || "minutes ago"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours} ${hours === 1 ? t("hourAgo") || "hour ago" : t("hoursAgo") || "hours ago"}`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? t("dayAgo") || "day ago" : t("daysAgo") || "days ago"}`;
}

const COLLAPSED_COUNT = 3;

export default function RecentPurchases() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newestKey, setNewestKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [, forceTick] = useState(0);
  const seenKeys = useRef<Set<string>>(new Set());
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/stats/recent");
      const data = await res.json();
      if (!res.ok) return;

      const list: Entry[] = data.recent || [];
      const topKey = list[0] ? `${list[0].number}-${list[0].assignedAt}` : null;

      if (
        topKey &&
        !seenKeys.current.has(topKey) &&
        seenKeys.current.size > 0
      ) {
        setNewestKey(topKey);
        setTimeout(() => setNewestKey(null), 1500);
      }
      list.forEach((e) => seenKeys.current.add(`${e.number}-${e.assignedAt}`));

      setEntries(list);
    }
    load();
    const interval = setInterval(load, 6000);
    const tickInterval = setInterval(() => forceTick((n) => n + 1), 20000);
    return () => {
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, []);

  if (entries.length === 0) return null;

  const visibleEntries = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
  const hiddenCount = entries.length - COLLAPSED_COUNT;

  return (
    <div className="ticket-stub hover-lift px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
            {t("recentLabel") || "Live activity"}
          </p>
          <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C]">
            {t("recentTitle") || "Recent purchases"}
          </h2>
        </div>
        <span className="urgent-dot w-2 h-2 rounded-full bg-[#4FBF8B] shrink-0 mt-1" />
      </div>

      <div className="space-y-2">
        {visibleEntries.map((e, i) => {
          const key = `${e.number}-${e.assignedAt}`;
          const isNew = key === newestKey;
          return (
            <div
              key={key}
              className={`slide-in flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isNew ? "bg-[#FFF8E6]" : "bg-[#FBF8EF]"
              }`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <span className="w-7 h-7 rounded-full bg-[#E7F5EC] text-[#0F5132] flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>

              <div className="flex-1 min-w-0">
                <p className="[font-family:var(--font-mono)] text-[10px] text-[#B4A968] mb-0.5">
                  {timeAgo(e.assignedAt, t)}
                </p>
                <p className="[font-family:var(--font-mono)] text-sm text-[#374151]">
                  {e.maskedPhone}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[#8A9A8F] text-[10px]">
                  {t("boughtLabel") || "Bought"}
                </p>
                <p className="[font-family:var(--font-fraunces)] font-bold text-[#E0A72E]">
                  #{e.number}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <div className={`expand-panel ${expanded ? "open" : ""}`}>
          <div />
        </div>
      )}

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="press-scale w-full flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-[#F0E9D0] text-[#0F5132] text-xs font-semibold hover:text-[#E0A72E] transition-colors"
        >
          {expanded
            ? t("showLessLabel") || "Show less"
            : t("showMoreLabel") || `Show ${hiddenCount} more`}
          <span
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      )}
    </div>
  );
}
