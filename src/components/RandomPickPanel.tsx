"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RandomPickPanel({
  onResult,
  disabled,
  maxNumber,
}: {
  onResult: (n: number) => Promise<void> | void;
  disabled: boolean;
  maxNumber: number;
}) {
  const [spinning, setSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const { t } = useLanguage();

  async function handlePick() {
    if (disabled || spinning) return;
    setSpinning(true);

    const res = await fetch("/api/numbers/preview-random");
    const result = await res.json();

    if (!res.ok) {
      setSpinning(false);
      return;
    }

    const finalNumber: number = result.number;

    // Rapid-cycle random numbers, slowing down toward the end, like a
    // slot machine settling — purely visual, the real number is already
    // decided by the server above, this is just the reveal animation.
    const totalTicks = 22;
    let tick = 0;

    function nextTick() {
      tick++;
      if (tick < totalTicks) {
        setDisplayNumber(Math.floor(Math.random() * maxNumber) + 1);
        // Ease the delay out — starts fast (60ms), ends slow (~220ms)
        const progress = tick / totalTicks;
        const delay = 60 + progress * progress * 220;
        setTimeout(nextTick, delay);
      } else {
        setDisplayNumber(finalNumber);
        setTimeout(async () => {
          setSpinning(false);
          await onResult(finalNumber);
        }, 400);
      }
    }

    nextTick();
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0F5132] to-[#0C4028] p-6 mb-6 text-center relative overflow-hidden">
      <div className="clover-spin text-3xl mb-2 inline-block">🍀</div>

      <h3 className="[font-family:var(--font-fraunces)] text-xl font-bold text-white mb-1">
        {t("feelingLuckyTitle") || "Feeling Lucky?"}
      </h3>
      <p className="text-[#B8D4C4] text-xs mb-5">
        {t("feelingLuckyDesc") || "Let us choose the best available number."}
      </p>

      <div className="slot-glow rounded-xl bg-black/25 h-20 flex items-center justify-center mb-5">
        <span className="[font-family:var(--font-mono)] text-4xl font-bold text-[#E0A72E] tabular-nums">
          {displayNumber !== null ? `#${displayNumber}` : "#———"}
        </span>
      </div>

      <button
        onClick={handlePick}
        disabled={disabled || spinning}
        className="press-scale w-full rounded-xl bg-[#E0A72E] text-[#14231C] font-bold py-3.5 disabled:opacity-50 hover:bg-[#D4A24C] hover:shadow-lg hover:shadow-[#E0A72E]/30 transition-all"
      >
        {spinning
          ? t("pickingText") || "Picking..."
          : `🍀 ${t("pickLuckyNumberButton") || "Pick My Lucky Number"}`}
      </button>
    </div>
  );
}
