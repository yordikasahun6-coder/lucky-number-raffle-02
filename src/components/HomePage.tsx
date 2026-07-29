"use client";

import PaymentAccountCard from "./PaymentAccountCard";
import BuyTicketForm from "./BuyTicketForm";
import StatusCheck from "./StatusCheck";
import Countdown from "./Countdown";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";

type Account = {
  id: string;
  name: string;
  account_holder: string;
  account_number: string;
  logo_url: string | null;
};
type Settings = {
  ticket_price: number;
  currency: string;
  closes_at: string | null;
};

export default function HomePage({
  assets,
  accounts,
  settings,
}: {
  assets: Record<string, string | null>;
  accounts: Account[];
  settings: Settings;
}) {
  const { t } = useLanguage();

  const steps = [
    {
      icon: assets.icon_step1,
      num: 1,
      title: t("step1Title"),
      desc: t("step1Desc"),
    },
    {
      icon: assets.icon_step2,
      num: 2,
      title: t("step2Title"),
      desc: t("step2Desc"),
    },
    {
      icon: assets.icon_step3,
      num: 3,
      title: t("step3Title"),
      desc: t("step3Desc"),
    },
    {
      icon: assets.icon_step4,
      num: 4,
      title: t("step4Title"),
      desc: t("step4Desc"),
    },
  ];

  const badges = [
    {
      icon: assets.icon_secure,
      title: t("badgeSecureTitle"),
      desc: t("badgeSecureDesc"),
    },
    {
      icon: assets.icon_fast,
      title: t("badgeFastTitle"),
      desc: t("badgeFastDesc"),
    },
    {
      icon: assets.icon_prizes,
      title: t("badgePrizesTitle"),
      desc: t("badgePrizesDesc"),
    },
  ];

  const footerBadges = [
    {
      icon: assets.icon_footer_fair,
      title: t("footerFairTitle"),
      desc: t("footerFairDesc"),
    },
    {
      icon: assets.icon_footer_support,
      title: t("footerSupportTitle"),
      desc: t("footerSupportDesc"),
    },
    {
      icon: assets.icon_footer_win,
      title: t("footerWinTitle"),
      desc: t("footerWinDesc"),
    },
  ];

  return (
    <main className="min-h-screen">
      <header className="max-w-3xl mx-auto px-5 pt-7 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          {assets.logo && (
            <img
              src={assets.logo}
              alt="Lucky Ticket"
              className="h-8 w-8 object-contain"
            />
          )}
          <span className="[font-family:var(--font-fraunces)] font-bold text-xl leading-none">
            <span className="text-[#0F5132]">Lucky</span>{" "}
            <span className="text-[#E0A72E]">Ticket</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {settings.closes_at && <Countdown closesAt={settings.closes_at} />}
          <LanguageToggle />
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 pt-8 pb-6">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <h1 className="[font-family:var(--font-fraunces)] text-5xl font-bold text-[#0F5132] leading-[1.05]">
              {t("heroTitle1")}
              <br />
              <span className="text-[#E0A72E]">{t("heroTitle2")}</span>
            </h1>
            <p className="text-[#4A5A50] mt-4 text-base max-w-sm">
              {t("heroSubtitle")}
            </p>
          </div>
          <div className="flex justify-center">
            {assets.hero_image ? (
              <img
                src={assets.hero_image}
                alt="Lottery"
                className="max-h-64 object-contain"
              />
            ) : (
              <div className="h-56 w-56 rounded-full bg-[#E7F5EC]" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-10">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-2"
            >
              {b.icon ? (
                <img
                  src={b.icon}
                  alt={b.title}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#E7F5EC]" />
              )}
              <div>
                <p className="font-bold text-[#14231C] text-xs">{b.title}</p>
                <p className="text-[#8A9A8F] text-[11px]">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-8">
        <div className="ticket-stub px-6 py-6">
          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
            Step 1
          </p>
          <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-1">
            {t("sendPaymentTitle")}
          </h2>
          <p className="text-[#8A9A8F] text-sm mb-5">{t("sendPaymentDesc")}</p>

          {accounts.length === 0 ? (
            <p className="text-[#8A9A8F] text-sm">{t("noPaymentMethods")}</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((a) => (
                <PaymentAccountCard
                  key={a.id}
                  account={a}
                  ticketPrice={settings.ticket_price}
                  currency={settings.currency}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-8">
        <div className="ticket-stub px-6 py-6">
          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
            Step 2
          </p>
          <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-1">
            {t("buyTicketTitle")}
          </h2>
          <p className="text-[#8A9A8F] text-sm mb-5">{t("buyTicketDesc")}</p>
          <BuyTicketForm accounts={accounts} />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <div className="ticket-stub px-6 py-6">
          <StatusCheck />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-14">
        <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] text-center mb-8">
          {t("howItWorksTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#E7F5EC] flex items-center justify-center mb-3">
                {s.icon ? (
                  <img
                    src={s.icon}
                    alt={s.title}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <span className="[font-family:var(--font-fraunces)] text-[#0F5132] font-bold">
                    {s.num}
                  </span>
                )}
              </div>
              <p className="font-bold text-[#14231C] text-sm">
                {s.num}. {s.title}
              </p>
              <p className="text-[#8A9A8F] text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0F5132] py-10">
        <div className="max-w-3xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {footerBadges.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 justify-center md:justify-start"
            >
              {b.icon ? (
                <img
                  src={b.icon}
                  alt={b.title}
                  className="w-8 h-8 object-contain shrink-0 brightness-0 invert"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
              )}
              <div>
                <p className="font-bold text-white text-sm">{b.title}</p>
                <p className="text-[#B8D4C4] text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
