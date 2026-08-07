"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function JourneyTimeline() {
  const { t } = useLanguage();

  const completed = [
    t("timelinePaymentReceived") || "Payment Received",
    t("timelineTicketApproved") || "Ticket Approved",
    t("timelineNumberSelected") || "Lucky Number Selected",
  ];

  const upcoming = [
    { icon: "⏳", text: t("timelineLiveDraw") || "Live Draw" },
    {
      icon: "🎉",
      text: t("timelineWinnerAnnouncement") || "Winner Announcement",
    },
    {
      icon: "💰",
      text: t("timelinePrizeDistribution") || "Prize Distribution",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/70 border border-[#EAE1C4] px-5 py-5 mb-6 text-left">
      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#4FBF8B] uppercase mb-2 font-bold">
        {t("timelineCompletedLabel") || "Completed"}
      </p>
      <div className="space-y-2 mb-4">
        {completed.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E7F5EC] text-[#0F5132] flex items-center justify-center text-[10px] font-bold shrink-0">
              ✓
            </span>
            <span className="text-[#374151] text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-[#EAE1C4] my-4" />

      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#B4A968] uppercase mb-2 font-bold">
        {t("timelineUpcomingLabel") || "Upcoming"}
      </p>
      <div className="space-y-2">
        {upcoming.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#F3EFDD] flex items-center justify-center text-[10px] shrink-0">
              {item.icon}
            </span>
            <span className="text-[#8A9A8F] text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
