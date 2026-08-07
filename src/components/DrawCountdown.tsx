"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DrawCountdown({
  closesAt,
}: {
  closesAt: string | null;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);
  const [closed, setClosed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!closesAt) return;
    function tick() {
      const diff = new Date(closesAt as string).getTime() - Date.now();
      if (diff <= 0) {
        setClosed(true);
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [closesAt]);

  if (!closesAt) {
    return (
      <div className="rounded-2xl bg-white/70 border border-[#EAE1C4] px-5 py-5 mb-6 text-center">
        <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#B9861F] uppercase mb-1 font-bold">
          {t("nextDrawLabel") || "Next Draw"}
        </p>
        <p className="text-[#6B8A78] text-sm">
          {t("quickDrawTBD") || "To be announced"}
        </p>
      </div>
    );
  }

  if (closed || !timeLeft) {
    return (
      <div className="rounded-2xl bg-[#FDF2F0] border border-[#F6D3CE] px-5 py-5 mb-6 text-center">
        <p className="text-[#E15B4F] text-sm font-semibold">
          {t("salesClosed") || "Ticket sales have closed"}
        </p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.d, label: t("daysUnit") || "Days" },
    { value: timeLeft.h, label: t("hoursUnit") || "Hours" },
    { value: timeLeft.m, label: t("minutesUnit") || "Minutes" },
    { value: timeLeft.s, label: t("secondsUnit") || "Seconds" },
  ];

  return (
    <div className="rounded-2xl bg-white/70 border border-[#EAE1C4] px-5 py-5 mb-6">
      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#B9861F] uppercase mb-3 font-bold text-center">
        {t("nextDrawLabel") || "Next Draw"}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u, i) => (
          <div
            key={i}
            className="rounded-xl bg-[#0F5132] px-2 py-3 text-center"
          >
            <p className="[font-family:var(--font-fraunces)] text-xl sm:text-2xl font-bold text-white leading-none">
              {String(u.value).padStart(2, "0")}
            </p>
            <p className="text-[#B8D4C4] text-[9px] uppercase tracking-wide mt-1">
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
