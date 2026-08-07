"use client";

import { useState, useEffect } from "react";

export default function Countdown({ closesAt }: { closesAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    function tick() {
      const diff = new Date(closesAt).getTime() - Date.now();
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

  if (closed) {
    return (
      <div className="rounded-2xl bg-[#FDF2F0] border border-[#F6D3CE] px-5 py-3 text-center">
        <p className="text-[#E15B4F] text-sm font-semibold">
          Ticket sales have closed
        </p>
      </div>
    );
  }

  if (!timeLeft) return null;

  const units = [
    { value: timeLeft.d, label: "D" },
    { value: timeLeft.h, label: "H" },
    { value: timeLeft.m, label: "M" },
    { value: timeLeft.s, label: "S" },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#0F5132] to-[#0C4028] px-4 sm:px-5 py-3 flex items-center gap-3 shadow-md">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="urgent-dot w-2 h-2 rounded-full bg-[#E0A72E]" />
        <span className="text-white/70 text-[10px] uppercase tracking-wide font-semibold hidden sm:inline">
          Closes in
        </span>
        <span className="text-white/70 text-[10px] uppercase tracking-wide font-semibold sm:hidden">
          ⏱
        </span>
      </div>

      <div className="flex items-center gap-1.5 [font-family:var(--font-mono)]">
        {units.map((u, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center leading-none">
              <span className="text-white font-bold text-base sm:text-lg">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[#E0A72E] text-[8px] font-bold">
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-white/30 text-sm -mt-1.5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
