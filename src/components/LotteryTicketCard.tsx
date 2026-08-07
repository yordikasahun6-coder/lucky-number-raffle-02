"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { generateTicketImage } from "@/lib/generateTicketImage";

export default function LotteryTicketCard({
  number,
  drawDateText,
  customerName,
  phone,
  delay = 0,
}: {
  number: number;
  drawDateText: string;
  customerName: string;
  phone: string;
  delay?: number;
}) {
  const { t } = useLanguage();

  function handleDownload() {
    const dataUrl = generateTicketImage({
      ticketNumber: number,
      customerName,
      phone,
      drawDateText,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `lucky-ticket-${number}.png`;
    link.click();
  }

  return (
    <div
      className="number-pop hover-lift lottery-ticket w-full max-w-xs mx-auto shadow-lg"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="px-6 pt-5 pb-3 text-center">
        <p className="[font-family:var(--font-mono)] text-[10px] tracking-[0.2em] text-[#E0A72E] uppercase font-bold">
          Lucky Ticket
        </p>
      </div>

      <div className="ticket-perforation mx-6" />

      <div className="px-6 py-5 space-y-4">
        <div className="text-center">
          <p className="text-white/50 text-[10px] uppercase tracking-wide mb-1">
            {t("ticketNumberLabel") || "Ticket Number"}
          </p>
          <p className="[font-family:var(--font-fraunces)] text-4xl font-bold text-white">
            #{number}
          </p>
        </div>

        <div className="flex justify-between items-center border-t border-white/10 pt-3">
          <div>
            <p className="text-white/50 text-[9px] uppercase tracking-wide mb-0.5">
              {t("drawDateTicketLabel") || "Draw Date"}
            </p>
            <p className="text-white text-xs font-medium">{drawDateText}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[9px] uppercase tracking-wide mb-0.5">
              {t("statusLabel") || "Status"}
            </p>
            <p className="text-[#4FBF8B] text-xs font-bold flex items-center gap-1 justify-end">
              {t("confirmedStatus") || "Confirmed"} ✓
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="press-scale w-full rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          ⬇ {t("downloadTicketButton") || "Download Ticket"}
        </button>
      </div>
    </div>
  );
}
