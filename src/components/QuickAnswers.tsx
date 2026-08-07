"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

type Prize = { title: string; amount: string };

export default function QuickAnswers({
  ticketPrice,
  currency,
  topPrize,
  closesAt,
}: {
  ticketPrice: number;
  currency: string;
  topPrize: Prize | null;
  closesAt: string | null;
}) {
  const { t } = useLanguage();

  const drawDateText = closesAt
    ? new Date(closesAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : t("quickDrawTBD") || "To be announced";

  const cards = [
    {
      icon: "🎟️",
      label: t("quickPriceLabel") || "Ticket Price",
      value: `${ticketPrice} ${currency}`,
    },
    {
      icon: "🏆",
      label: t("quickPrizeLabel") || "Grand Prize",
      value: topPrize ? topPrize.amount : t("quickPrizeTBD") || "Coming soon",
    },
    {
      icon: "📅",
      label: t("quickDrawLabel") || "Draw Date",
      value: drawDateText,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="hover-lift flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-[#EAE1C4] px-2 py-4 sm:px-4 sm:py-5 text-center min-h-[130px] sm:min-h-[140px]"
        >
          <div className="text-xl sm:text-2xl mb-1.5 leading-none">
            {c.icon}
          </div>
          <p className="text-[#8A9A8F] text-[9px] sm:text-[11px] uppercase tracking-wide font-medium mb-1.5 leading-tight">
            {c.label}
          </p>
          <p
            className={`[font-family:var(--font-fraunces)] font-bold text-[#0F5132] leading-tight break-words ${
              c.value.length > 10
                ? "text-xs sm:text-sm"
                : "text-base sm:text-lg"
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
