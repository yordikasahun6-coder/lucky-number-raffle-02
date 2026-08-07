"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReassuranceChecklist() {
  const { t } = useLanguage();

  const items = [
    { icon: "💳", text: t("reassurePayment") || "Payment Verified" },
    { icon: "🎫", text: t("reassureTicket") || "Ticket Registered" },
    { icon: "📩", text: t("reassureSms") || "Confirmation Sent" },
    { icon: "📡", text: t("reassureReady") || "Ready for the Live Draw" },
  ];

  return (
    <div className="rounded-2xl bg-white/70 border border-[#EAE1C4] px-5 py-4 mb-6">
      <div className="grid sm:grid-cols-2 gap-y-3 gap-x-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="checklist-item flex items-center gap-2.5"
            style={{ animationDelay: `${0.6 + i * 0.1}s` }}
          >
            <span className="w-8 h-8 rounded-full bg-[#E7F5EC] flex items-center justify-center text-sm shrink-0">
              {item.icon}
            </span>
            <span className="text-[#374151] text-sm font-medium">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
