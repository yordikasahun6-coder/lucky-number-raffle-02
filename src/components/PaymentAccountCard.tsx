"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import CopyButton from "./CopyButton";

type Account = {
  id: string;
  name: string;
  account_holder: string;
  account_number: string;
  logo_url: string | null;
  qr_code_url: string | null;
};

export default function PaymentAccountCard({
  account,
  ticketPrice,
  currency,
}: {
  account: Account;
  ticketPrice: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="hover-lift rounded-2xl border border-[#EAE1C4] bg-[#FFFEFA] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="press-scale w-full flex items-center gap-3 px-5 py-4 hover:bg-[#FBF8EF] transition text-left"
      >
        {account.logo_url ? (
          <img
            src={account.logo_url}
            alt={account.name}
            className="w-9 h-9 object-contain shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#E7F5EC] shrink-0" />
        )}
        <span className="font-bold text-[#14231C] text-sm flex-1">
          {account.name}
        </span>
        <span
          className={`text-[#E0A72E] text-xs transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div className={`expand-panel ${open ? "open" : ""}`}>
        <div>
          <div className="ticket-divider px-6" />
          <div className="px-6 pb-6 pt-5">
            <div className="flex items-baseline justify-between mb-5">
              <span className="text-[#8A9A8F] text-xs">{t("ticketPrice")}</span>
              <span className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#E0A72E]">
                {ticketPrice} <span className="text-sm">{currency}</span>
              </span>
            </div>

            <div className="space-y-2 mb-4 [font-family:var(--font-mono)] text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8A9A8F]">{t("accountHolder")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#14231C] font-medium">
                    {account.account_holder}
                  </span>
                  <CopyButton value={account.account_holder} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8A9A8F]">{t("accountNumber")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#14231C] font-medium">
                    {account.account_number}
                  </span>
                  <CopyButton value={account.account_number} />
                </div>
              </div>
            </div>

            {account.qr_code_url && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="press-scale w-full flex items-center justify-center gap-2 rounded-lg border border-[#E0A72E] text-[#B9861F] text-xs font-semibold px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors"
                >
                  ⬛{" "}
                  {showQr
                    ? t("hideQr") || "Hide QR code"
                    : t("showQr") || "Show QR code"}
                </button>

                <div className={`expand-panel ${showQr ? "open" : ""}`}>
                  <div>
                    <div className="flex justify-center pt-4">
                      <img
                        src={account.qr_code_url}
                        alt="Payment QR code"
                        className="w-40 h-40 rounded-xl border-2 border-[#EAE1C4] object-contain bg-white p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {[t("flowSend"), t("flowScreenshot"), t("flowSubmit")].map(
                (label, i, arr) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex-1 text-center">
                      <div className="w-8 h-8 mx-auto rounded-full bg-[#E7F5EC] flex items-center justify-center text-[#0F5132] text-xs font-bold mb-1.5">
                        {i + 1}
                      </div>
                      <p className="text-[10px] text-[#8A9A8F] leading-tight">
                        {label}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-[#EAE1C4] text-base mb-4">→</span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
