"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TicketProgress() {
  const [sold, setSold] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(1000);
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/stats/progress");
      const data = await res.json();
      if (res.ok) {
        setSold(data.sold);
        setTotal(data.total);
      }
    }
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  if (sold === null) return null;

  const remaining = total - sold;
  const percent = (sold / total) * 100;

  return (
    <div className="ticket-stub hover-lift px-6 py-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase">
          {t("ticketsSoldLabel") || "Tickets claimed"}
        </p>
        <p className="[font-family:var(--font-mono)] text-xs text-[#8A9A8F]">
          {Math.round(percent)}%
        </p>
      </div>

      <div className="relative h-4 rounded-full bg-[#F3EFDD] overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0F5132] to-[#4FBF8B] transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)",
            }}
          />
        </div>
        {percent > 6 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${percent}%`, transform: "translate(-100%, -50%)" }}
          >
            <span className="block w-2 h-2 rounded-full bg-white shadow mr-1" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#0F5132]">
            {sold}
          </span>
          <span className="text-[#8A9A8F] text-sm">
            {" "}
            / {total} {t("ticketsAvailable") || "tickets"}
          </span>
        </div>
        <div className="text-right">
          <span className="[font-family:var(--font-fraunces)] text-lg font-bold text-[#E0A72E]">
            {remaining}
          </span>
          <p className="text-[#8A9A8F] text-[11px]">
            {t("remainingLabel") || "remaining"}
          </p>
        </div>
      </div>
    </div>
  );
}
