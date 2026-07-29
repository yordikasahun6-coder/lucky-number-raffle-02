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
      <div className="rounded-xl bg-[#FDF2F0] border border-[#F6D3CE] px-4 py-2.5 text-center">
        <p className="text-[#E15B4F] text-sm font-semibold">
          Ticket sales have closed
        </p>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="rounded-xl bg-[#FFF8E6] border border-[#F0D68A] px-4 py-2.5 flex items-center justify-center gap-3">
      <span className="text-[#B9861F] text-xs font-medium">Closes in</span>
      <div className="flex items-center gap-1.5 [font-family:var(--font-mono)] text-sm font-bold text-[#0F5132]">
        {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
        <span>{String(timeLeft.h).padStart(2, "0")}h</span>
        <span>{String(timeLeft.m).padStart(2, "0")}m</span>
        <span>{String(timeLeft.s).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
