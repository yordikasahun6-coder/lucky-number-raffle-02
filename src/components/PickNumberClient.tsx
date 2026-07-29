"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import ConfettiBurst from "./ConfettiBurst";

const PER_PAGE = 100;
const TOTAL = 1000;

export default function PickNumberClient({
  assets,
}: {
  assets: Record<string, string | null>;
}) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [approved, setApproved] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [myNumbers, setMyNumbers] = useState<number[]>([]);
  const [takenNumbers, setTakenNumbers] = useState<Set<number>>(new Set());

  const [selected, setSelected] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [rolling, setRolling] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");
    if (phoneFromUrl) setPhone(phoneFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (phone && !statusChecked) checkStatus();
  }, [phone]);

  useEffect(() => {
    if (!approved || availableCredits < 1) return;
    const interval = setInterval(() => {
      refreshStatus();
    }, 7000);
    return () => clearInterval(interval);
  }, [approved, availableCredits]);

  async function checkStatus() {
    if (!phone.trim()) return;
    setChecking(true);
    setError("");
    const res = await fetch(
      `/api/payments/check-status?phone=${encodeURIComponent(phone.trim())}`,
    );
    const result = await res.json();
    setApproved(result.approved);
    setAvailableCredits(result.availableCredits || 0);
    setMyNumbers(result.myNumbers || []);
    setTakenNumbers(new Set(result.takenNumbers || []));
    setStatusChecked(true);
    setChecking(false);
  }

  async function refreshStatus() {
    const res = await fetch(
      `/api/payments/check-status?phone=${encodeURIComponent(phone.trim())}`,
    );
    const result = await res.json();
    setApproved(result.approved);
    setAvailableCredits(result.availableCredits || 0);
    setMyNumbers(result.myNumbers || []);
    setTakenNumbers(new Set(result.takenNumbers || []));
  }

  function selectNumber(n: number) {
    if (takenNumbers.has(n) || availableCredits < 1) return;
    setSelected(n);
    setError("");
  }

  async function confirmSelection() {
    if (selected === null) return;
    setConfirming(true);
    setError("");
    const res = await fetch("/api/numbers/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), number: selected }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Could not claim that number.");
      setConfirming(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      await refreshStatus();
      return;
    }
    setJustClaimed(result.number);
    setSelected(null);
    await refreshStatus();
    setConfirming(false);
  }

  async function pickRandom() {
    if (availableCredits < 1) return;
    setError("");
    setRolling(true);
    const res = await fetch("/api/numbers/preview-random");
    const result = await res.json();
    setTimeout(() => setRolling(false), 300);
    if (!res.ok) {
      setError(result.error || "Could not find a number.");
      return;
    }
    setSelected(result.number);
  }

  const searchedNumber = search.trim() ? parseInt(search.trim(), 10) : null;
  const pageNumbers = useMemo(() => {
    if (searchedNumber && searchedNumber >= 1 && searchedNumber <= TOTAL) {
      return [searchedNumber];
    }
    const start = (page - 1) * PER_PAGE + 1;
    return Array.from({ length: PER_PAGE }, (_, i) => start + i);
  }, [page, searchedNumber]);

  const totalPages = Math.ceil(TOTAL / PER_PAGE);

  if (!statusChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full number-pop">
          <div className="flex items-center justify-between mb-6">
            <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8A9A8F] uppercase">
              {t("pickStep2")}
            </p>
            <LanguageToggle />
          </div>
          <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#14231C] mb-6">
            {t("pickTitle")}
          </h1>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("pickPhonePlaceholder")}
            className="w-full rounded-xl border border-[#D9D0B0] px-4 py-3 text-[#14231C] placeholder-[#B4C0B8] focus:outline-none focus:ring-2 focus:ring-[#0F5132] mb-3 transition-shadow"
          />
          <button
            onClick={checkStatus}
            disabled={checking}
            className="press-scale w-full rounded-xl bg-[#0F5132] text-white font-semibold py-3 disabled:opacity-50 hover:bg-[#0C4028] transition-colors"
          >
            {checking ? t("checking") : t("checkMyStatus")}
          </button>
        </div>
      </main>
    );
  }

  if (!approved) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm number-pop">
          <div className="flex justify-center mb-4">
            <LanguageToggle />
          </div>
          <div className="text-4xl mb-4 float-hero inline-block">
            {myNumbers.length > 0 ? "🎟️" : "⏳"}
          </div>
          <h1 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-2">
            {myNumbers.length > 0 ? t("noTicketTitle") : t("stillReviewTitle")}
          </h1>
          <p className="text-[#8A9A8F] text-sm">
            {myNumbers.length > 0 ? t("noTicketDesc") : t("stillReviewDesc")}
          </p>
          {myNumbers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {myNumbers.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-[#E7F5EC] text-[#0F5132] [font-family:var(--font-mono)] px-3 py-1 text-sm font-medium"
                >
                  #{n}
                </span>
              ))}
            </div>
          )}
          <a
            href="/"
            className="inline-block mt-6 text-[#0F5132] text-sm underline hover:text-[#E0A72E] transition-colors"
          >
            {t("backHome")}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob-1 absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E7F5EC] opacity-50 blur-3xl" />
        <div className="blob-2 absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-[#FFF3D6] opacity-40 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6 number-pop">
          <a
            href="/"
            className="press-scale w-9 h-9 rounded-full border border-[#EAE1C4] flex items-center justify-center text-[#8A9A8F] hover:border-[#0F5132] hover:text-[#0F5132] transition-colors"
          >
            ‹
          </a>
          <div className="flex items-center gap-2">
            {assets.logo && (
              <img
                src={assets.logo}
                alt=""
                className="h-7 w-7 object-contain"
              />
            )}
            <span className="[font-family:var(--font-fraunces)] font-bold text-lg">
              <span className="text-[#0F5132]">Lucky</span>{" "}
              <span className="text-[#E0A72E]">Ticket</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="pulse-ring rounded-full bg-[#E7F5EC] text-[#0F5132] text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              ✓ {availableCredits} {t("ticketsAvailable")}
              {availableCredits !== 1 ? "s" : ""}
            </div>
            <LanguageToggle />
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center mb-8">
          <div className="number-pop" style={{ animationDelay: "0.05s" }}>
            <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#14231C] mb-2">
              {t("pickLuckyTitle")}
            </h1>
            <p className="text-[#8A9A8F] text-sm">{t("pickLuckyDesc")}</p>
          </div>
          {assets.hero_image && (
            <img
              src={assets.hero_image}
              alt=""
              className="float-hero max-h-32 object-contain mx-auto"
            />
          )}
        </div>

        {myNumbers.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {myNumbers.map((n) => (
              <span
                key={n}
                className="rounded-full bg-[#E7F5EC] text-[#0F5132] [font-family:var(--font-mono)] px-3 py-1 text-sm font-medium"
              >
                {t("alreadyYours")}: #{n}
              </span>
            ))}
          </div>
        )}

        {justClaimed && (
          <div className="claim-burst relative mb-4 rounded-xl bg-[#FFF8E6] border-2 border-[#E0A72E] p-6 text-center overflow-visible">
            <ConfettiBurst />
            <p className="text-[#8A9A8F] text-sm">{t("youClaimed")}</p>
            <p className="[font-family:var(--font-fraunces)] text-4xl font-bold text-[#E0A72E]">
              #{justClaimed}
            </p>
          </div>
        )}

        {error && (
          <p
            className={`text-red-600 text-sm mb-4 ${shake ? "shake-error" : ""}`}
          >
            {error}
          </p>
        )}

        {availableCredits > 0 ? (
          <>
            <div className="hover-lift rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] p-4 flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0F5132] ${rolling ? "animate-spin" : ""}`}
                >
                  🎲
                </div>
                <div>
                  <p className="font-bold text-[#14231C] text-sm">
                    {t("pickRandomTitle")}
                  </p>
                  <p className="text-[#6B8A78] text-xs">
                    {t("pickRandomDesc")}
                  </p>
                </div>
              </div>
              <button
                onClick={pickRandom}
                disabled={confirming}
                className="press-scale rounded-lg bg-[#0F5132] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 whitespace-nowrap hover:bg-[#0C4028] transition-colors"
              >
                {confirming ? "..." : `✦ ${t("pickRandomButton")}`}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-4 text-xs text-[#6B8A78]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4FBF8B]" />{" "}
                  {t("legendAvailable")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E0A72E]" />{" "}
                  {t("legendSelected")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E15B4F]" />{" "}
                  {t("legendTaken")}
                </span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder={t("searchPlaceholder")}
                className="rounded-lg border border-[#D9D0B0] px-3 py-1.5 text-sm text-[#14231C] w-36 focus:outline-none focus:ring-2 focus:ring-[#0F5132] transition-shadow"
              />
            </div>

            <div className="rounded-xl border border-[#EAE1C4] bg-white p-4">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {pageNumbers.map((n, i) => {
                  const isMine = myNumbers.includes(n);
                  const isTaken = takenNumbers.has(n);
                  const isSelected = selected === n;

                  let style =
                    "border-[#CFE9D8] text-[#0F5132] hover:bg-[#F0FBF4] hover:scale-105";
                  if (isTaken || isMine)
                    style =
                      "border-[#F6D3CE] bg-[#FDF2F0] text-[#E15B4F] cursor-not-allowed";
                  if (isSelected)
                    style =
                      "border-[#E0A72E] bg-[#FFF8E6] text-[#B9861F] scale-110";

                  return (
                    <button
                      key={`${page}-${n}`}
                      onClick={() => selectNumber(n)}
                      disabled={isTaken || isMine}
                      className={`number-pop press-scale aspect-square rounded-lg border [font-family:var(--font-mono)] text-xs flex items-center justify-center transition-all duration-200 ${style}`}
                      style={{ animationDelay: `${(i % 20) * 0.012}s` }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              {!searchedNumber && (
                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="press-scale w-7 h-7 rounded border border-[#EAE1C4] text-[#8A9A8F] disabled:opacity-30 hover:border-[#0F5132] transition-colors"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`press-scale w-7 h-7 rounded transition-colors ${p === page ? "bg-[#0F5132] text-white" : "text-[#6B8A78] hover:bg-[#E7F5EC]"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="press-scale w-7 h-7 rounded border border-[#EAE1C4] text-[#8A9A8F] disabled:opacity-30 hover:border-[#0F5132] transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {selected !== null && (
              <div className="claim-burst mt-4 rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[#6B8A78] text-xs">
                    {t("yourSelectedNumber")}
                  </p>
                  <p className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#0F5132]">
                    {selected}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={pickRandom}
                    disabled={confirming}
                    className="press-scale rounded-lg border border-[#0F5132] text-[#0F5132] text-sm font-semibold px-4 py-2.5 disabled:opacity-50 hover:bg-[#0F5132] hover:text-white transition-colors"
                  >
                    🎲 {t("tryAnother")}
                  </button>
                  <button
                    onClick={confirmSelection}
                    disabled={confirming}
                    className="press-scale rounded-lg bg-[#0F5132] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 hover:bg-[#0C4028] transition-colors"
                  >
                    {confirming ? t("confirming") : t("confirmButton")}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] p-3 text-xs text-[#4338CA]">
              {t("confirmNote")}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white border border-[#EAE1C4] p-6 text-center">
            <p className="text-[#14231C] text-sm font-medium mb-1">
              {t("usedAllTitle")}
            </p>
            <p className="text-[#8A9A8F] text-xs">{t("usedAllDesc")}</p>
          </div>
        )}

        {/* ===== POWERED BY CODEXA FOOTER ===== */}
        <footer className="mt-10 pt-6 border-t border-[#EAE1C4]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[#8A9A8F] text-xs">
              &copy; {new Date().getFullYear()} Lucky Ticket. All rights
              reserved.
            </p>
            <p className="text-[#8A9A8F] text-xs flex items-center gap-1.5">
              Powered by{" "}
              <a
                href="https://kodexa-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://kodexa-portfolio.vercel.app/",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="text-[#E0A72E] font-bold hover:text-[#C8951A] transition-colors duration-300 hover:underline underline-offset-2 cursor-pointer"
              >
                kodexa
              </a>
              <span className="text-[#B4C0B8]">|</span>
              <span className="text-[#B4C0B8] text-[10px]">v2.0</span>
            </p>
          </div>
          <p className="text-[#B4C0B8] text-[10px] text-center mt-2 tracking-wider">
            ✦ Crafted with precision by kodexa Technologies ✦
          </p>
        </footer>
        {/* ===== END FOOTER ===== */}
      </div>
    </main>
  );
}
