"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

const PER_PAGE = 100;
const TOTAL = 1000;

export default function PickNumberClient({
  assets,
}: {
  assets: Record<string, string | null>;
}) {
  const searchParams = useSearchParams();

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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");
    if (phoneFromUrl) setPhone(phoneFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (phone && !statusChecked) checkStatus();
  }, [phone]);

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
  useEffect(() => {
    if (!approved || availableCredits < 1) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 7000);

    return () => clearInterval(interval);
  }, [approved, availableCredits]);
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
    const res = await fetch("/api/numbers/preview-random");
    const result = await res.json();
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

  // --- Step 1: enter phone ---
  if (!statusChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8A9A8F] uppercase mb-2">
            Step 2
          </p>
          <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#14231C] mb-6">
            Pick your number
          </h1>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full rounded-xl border border-[#D9D0B0] px-4 py-3 text-[#14231C] placeholder-[#B4C0B8] focus:outline-none focus:ring-2 focus:ring-[#0F5132] mb-3"
          />
          <button
            onClick={checkStatus}
            disabled={checking}
            className="w-full rounded-xl bg-[#0F5132] text-white font-semibold py-3 disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check my status"}
          </button>
        </div>
      </main>
    );
  }

  // --- Not approved / no credit left ---
  if (!approved) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <div className="text-4xl mb-4">
            {myNumbers.length > 0 ? "🎟️" : "⏳"}
          </div>
          <h1 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-2">
            {myNumbers.length > 0
              ? "No ticket available"
              : "Still under review"}
          </h1>
          <p className="text-[#8A9A8F] text-sm">
            {myNumbers.length > 0
              ? "You've already used your approved payment to claim a number. Submit a new payment for another ticket."
              : "We'll notify you once your payment is approved. Check back soon."}
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
            className="inline-block mt-6 text-[#0F5132] text-sm underline"
          >
            Back to home
          </a>
        </div>
      </main>
    );
  }

  // --- Main picker ---
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="w-9 h-9 rounded-full border border-[#EAE1C4] flex items-center justify-center text-[#8A9A8F]"
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
          <div className="rounded-full bg-[#E7F5EC] text-[#0F5132] text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
            ✓ {availableCredits} ticket{availableCredits !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center mb-8">
          <div>
            <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#14231C] mb-2">
              Pick Your Lucky Number
            </h1>
            <p className="text-[#8A9A8F] text-sm">
              Choose any number between 1 and 1,000, or let us pick one for you.
            </p>
          </div>
          {assets.hero_image && (
            <img
              src={assets.hero_image}
              alt=""
              className="max-h-32 object-contain mx-auto"
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
                Already yours: #{n}
              </span>
            ))}
          </div>
        )}

        {justClaimed && (
          <div className="mb-4 rounded-xl bg-[#FFF8E6] border border-[#E0A72E] p-4 text-center">
            <p className="text-[#8A9A8F] text-sm">You claimed</p>
            <p className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#E0A72E]">
              #{justClaimed}
            </p>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {availableCredits > 0 ? (
          <>
            <div className="rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] p-4 flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0F5132]">
                  🎲
                </div>
                <div>
                  <p className="font-bold text-[#14231C] text-sm">
                    Pick a random number
                  </p>
                  <p className="text-[#6B8A78] text-xs">
                    Get a random available number instantly
                  </p>
                </div>
              </div>
              <button
                onClick={pickRandom}
                disabled={confirming}
                className="rounded-lg bg-[#0F5132] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 whitespace-nowrap"
              >
                {confirming ? "..." : "✦ Pick Random"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-4 text-xs text-[#6B8A78]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4FBF8B]" />{" "}
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E0A72E]" />{" "}
                  Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E15B4F]" /> Taken
                </span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Search number..."
                className="rounded-lg border border-[#D9D0B0] px-3 py-1.5 text-sm text-[#14231C] w-36 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            <div className="rounded-xl border border-[#EAE1C4] bg-white p-4">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
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
                      className={`aspect-square rounded-lg border [font-family:var(--font-mono)] text-xs flex items-center justify-center transition ${style}`}
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
                    className="w-7 h-7 rounded border border-[#EAE1C4] text-[#8A9A8F] disabled:opacity-30"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded ${p === page ? "bg-[#0F5132] text-white" : "text-[#6B8A78]"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded border border-[#EAE1C4] text-[#8A9A8F] disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {selected !== null && (
              <div className="mt-4 rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[#6B8A78] text-xs">Your selected number</p>
                  <p className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#0F5132]">
                    {selected}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={pickRandom}
                    disabled={confirming}
                    className="rounded-lg border border-[#0F5132] text-[#0F5132] text-sm font-semibold px-4 py-2.5 disabled:opacity-50"
                  >
                    🎲 Try another
                  </button>
                  <button
                    onClick={confirmSelection}
                    disabled={confirming}
                    className="rounded-lg bg-[#0F5132] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
                  >
                    {confirming ? "Confirming..." : "Confirm this number"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] p-3 text-xs text-[#4338CA]">
              Please make sure your number is correct — once confirmed, it can't
              be changed.
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white border border-[#EAE1C4] p-6 text-center">
            <p className="text-[#14231C] text-sm font-medium mb-1">
              You've used your available ticket(s).
            </p>
            <p className="text-[#8A9A8F] text-xs">
              Submit a new payment on the homepage for another number.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
