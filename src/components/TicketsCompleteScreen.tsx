"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import Fireworks from "./Fireworks";
import AnimatedCheck from "./AnimatedCheck";
import LotteryTicketCard from "./LotteryTicketCard";
import ReassuranceChecklist from "./ReassuranceChecklist";
import DrawCountdown from "./DrawCountdown";
import JourneyTimeline from "./JourneyTimeline";
import CelebrationAmbience from "./CelebrationAmbience";
import LanguageToggle from "./LanguageToggle";

export default function TicketsCompleteScreen({
  numbers,
  drawDate,
  customerName,
  phone,
}: {
  numbers: number[];
  drawDate: string | null;
  customerName: string;
  phone: string;
}) {
  const { t } = useLanguage();

  const drawDateText = drawDate
    ? new Date(drawDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("quickDrawTBD") || "To be announced";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob-1 absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E7F5EC] opacity-50 blur-3xl" />
        <div className="blob-2 absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-[#FFF3D6] opacity-40 blur-3xl" />
      </div>

      <Fireworks />
      <CelebrationAmbience />

      <div className="claim-burst max-w-lg w-full text-center relative z-10">
        <div className="flex justify-center mb-2">
          <LanguageToggle />
        </div>

        <AnimatedCheck />

        <div className="content-reveal" style={{ animationDelay: "0.55s" }}>
          <h1 className="[font-family:var(--font-fraunces)] text-3xl sm:text-4xl font-bold text-[#0F5132] mb-1 leading-tight">
            🏆 {t("congratsTitle") || "Congratulations!"}
          </h1>

          <p className="text-[#4A5A50] text-base mb-4 max-w-sm mx-auto">
            {numbers.length === 1
              ? t("secuedDescSingle") || "Your lucky number has been secured."
              : t("secuedDescMulti") ||
                `All ${numbers.length} of your lucky numbers have been secured.`}
          </p>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F5EC] text-[#0F5132] text-xs font-bold px-4 py-1.5 mb-8">
            ✓ {t("ticketRegisteredBadge") || "Ticket Successfully Registered"}
          </span>
        </div>

        <div className="mb-6 relative">
          <div className="glow-pulse absolute inset-0 -z-10 bg-[#E0A72E] blur-3xl rounded-full opacity-30" />

          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#B9861F] uppercase mb-4 font-bold">
            {numbers.length === 1
              ? t("yourNumberLabel") || "Your winning number"
              : t("yourTicketsLabel") || "Your tickets"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {numbers.map((n, i) => (
              <LotteryTicketCard
                key={n}
                number={n}
                drawDateText={drawDateText}
                customerName={customerName}
                phone={phone}
                delay={i * 0.12}
              />
            ))}
          </div>
        </div>

        <ReassuranceChecklist />
        <DrawCountdown closesAt={drawDate} />
        <JourneyTimeline />

        {/* Lost ticket notice */}
        <p className="text-[#8A9A8F] text-xs mb-3">
          {t("lostTicketNotice") ||
            "Lost this page? Just enter your phone number on the homepage anytime to see your tickets again."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/#buy-ticket"
            className="press-scale inline-flex items-center gap-2 rounded-xl bg-[#E0A72E] text-[#14231C] font-semibold px-8 py-3 hover:bg-[#D4A24C] hover:shadow-lg hover:shadow-[#E0A72E]/30 transition-all order-1 sm:order-1"
          >
            🎟️ {t("buyAnotherButton") || "Buy Another Ticket"}
          </a>

          <a
            href="/"
            className="press-scale inline-block rounded-xl bg-transparent border-2 border-[#0F5132] text-[#0F5132] font-semibold px-8 py-3 hover:bg-[#0F5132] hover:text-white transition-colors order-2 sm:order-2"
          >
            {t("backHome") || "Back to home"}
          </a>
        </div>
      </div>
    </main>
  );
}
