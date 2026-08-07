"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import ConfettiBurst from "./ConfettiBurst";
import TicketsCompleteScreen from "./TicketsCompleteScreen";
import RandomPickPanel from "./RandomPickPanel";

const PER_PAGE = 100;

export default function PickNumberClient({
  assets,
  closesAt,
  maxNumber,
}: {
  assets: Record<string, string | null>;
  closesAt: string | null;
  maxNumber: number;
}) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [approved, setApproved] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [myNumbers, setMyNumbers] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState("");
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
    setCustomerName(result.customerName || ""); // <-- ADD THIS LINE
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
    setCustomerName(result.customerName || ""); // <-- ADD THIS LINE
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
    if (searchedNumber && searchedNumber >= 1 && searchedNumber <= maxNumber) {
      return [searchedNumber];
    }
    const start = (page - 1) * PER_PAGE + 1;
    return Array.from({ length: PER_PAGE }, (_, i) => start + i);
  }, [page, searchedNumber]);

  const totalPages = Math.ceil(maxNumber / PER_PAGE);

  // ===== Finished all their tickets — show the celebration screen =====
  // This check must come before the "!approved" check below, because
  // once every ticket is claimed, `approved` naturally becomes false
  // (no credits left) — but that does NOT mean "still under review",
  // it means "done". So we check this condition first.
  if (statusChecked && myNumbers.length > 0 && availableCredits === 0) {
    return (
      <TicketsCompleteScreen
        numbers={myNumbers}
        drawDate={closesAt}
        customerName={customerName}
        phone={phone}
      />
    );
  }

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
          <div className="text-4xl mb-4 float-hero inline-block">⏳</div>
          <h1 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-2">
            {t("stillReviewTitle")}
          </h1>
          <p className="text-[#8A9A8F] text-sm">{t("stillReviewDesc")}</p>
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
            <p className="text-[#8A9A8F] text-sm">
              {(
                t("pickLuckyDesc") ||
                "Choose any number between 1 and {max}, or let us pick one for you."
              ).replace("{max}", maxNumber.toLocaleString())}
            </p>
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

        {availableCredits > 0 && (
          <>
            <RandomPickPanel
              disabled={confirming}
              maxNumber={maxNumber}
              onResult={(n) => {
                setSelected(n);
                setError("");
              }}
            />

            {selected !== null && (
              <div className="claim-burst mb-6 rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[#6B8A78] text-xs">
                    {t("yourSelectedNumber")}
                  </p>
                  <p className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#0F5132]">
                    {selected}
                  </p>
                </div>
                <button
                  onClick={confirmSelection}
                  disabled={confirming}
                  className="press-scale rounded-lg bg-[#0F5132] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 hover:bg-[#0C4028] transition-colors"
                >
                  {confirming ? t("confirming") : t("confirmButton")}
                </button>
              </div>
            )}

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
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B4C0B8] text-xs pointer-events-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder={t("searchPlaceholder")}
                  className={`rounded-full border-2 pl-8 pr-8 py-2 text-sm text-[#14231C] w-40 focus:outline-none transition-all duration-300 ${
                    search
                      ? "border-[#0F5132] shadow-[0_0_0_4px_rgba(15,81,50,0.08)]"
                      : "border-[#D9D0B0] focus:border-[#0F5132] focus:shadow-[0_0_0_4px_rgba(15,81,50,0.08)]"
                  }`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="press-scale absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EAE1C4] text-[#8A9A8F] text-[10px] flex items-center justify-center hover:bg-[#D9D0B0] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#EAE1C4] bg-white p-4">
              {searchedNumber &&
              searchedNumber >= 1 &&
              searchedNumber <= maxNumber ? (
                <div className="flex flex-col items-center py-4">
                  <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#B4A968] uppercase mb-3">
                    {t("searchResultLabel") || "Search result"}
                  </p>
                  {pageNumbers.map((n) => {
                    const isMine = myNumbers.includes(n);
                    const isTaken = takenNumbers.has(n);
                    const isSelected = selected === n;

                    let style =
                      "border-[#CFE9D8] text-[#0F5132] hover:bg-[#F0FBF4]";
                    if (isTaken || isMine)
                      style =
                        "border-[#F6D3CE] bg-[#FDF2F0] text-[#E15B4F] cursor-not-allowed";
                    if (isSelected)
                      style = "border-[#E0A72E] bg-[#FFF8E6] text-[#B9861F]";

                    return (
                      <button
                        key={n}
                        onClick={() => selectNumber(n)}
                        disabled={isTaken || isMine}
                        className={`search-spotlight press-scale w-28 h-28 rounded-2xl border-2 [font-family:var(--font-mono)] text-3xl font-bold flex items-center justify-center transition-colors ${style}`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  {takenNumbers.has(searchedNumber) && (
                    <p className="text-[#E15B4F] text-xs mt-3">
                      {t("numberTakenNotice") || "This number is already taken"}
                    </p>
                  )}
                </div>
              ) : search ? (
                <div className="search-empty-shake flex flex-col items-center py-8 text-center">
                  <span className="text-3xl mb-2">🔎</span>
                  <p className="text-[#8A9A8F] text-sm">
                    {t("searchOutOfRange") ||
                      "Enter a number between 1 and 1000"}
                  </p>
                </div>
              ) : (
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
              )}

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
        )}
      </div>
    </main>
  );
}
