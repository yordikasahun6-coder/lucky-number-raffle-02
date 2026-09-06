"use client";

import { useState, useEffect, useRef } from "react";

type Payment = {
  id: string;
  phone_number: string;
  customer_name: string;
  method: string;
  screenshot_url: string | null;
  submitted_at: string;
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function AdminPaymentRow({ payment }: { payment: Payment }) {
  const [reference, setReference] = useState("");
  const [checkState, setCheckState] = useState<
    "idle" | "checking" | "clear" | "used"
  >("idle");
  const [usedByPhone, setUsedByPhone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [safeMax, setSafeMax] = useState<number | null>(null);
  const [rejectionCount, setRejectionCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/admin/capacity")
      .then((res) => res.json())
      .then((data) => setSafeMax(data.safeMax))
      .catch(() => setSafeMax(null));
  }, []);
  useEffect(() => {
    fetch(
      `/api/admin/rejection-history?phone=${encodeURIComponent(payment.phone_number)}`,
    )
      .then((res) => res.json())
      .then((data) => setRejectionCount(data.rejectionCount || 0))
      .catch(() => {});
  }, [payment.phone_number]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (reference.trim().length === 0) {
      setCheckState("idle");
      return;
    }
    setCheckState("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/payments/check-reference?reference=${encodeURIComponent(reference.trim())}`,
        );
        const result = await res.json();
        if (result.used) {
          setCheckState("used");
          setUsedByPhone(result.phone);
        } else {
          setCheckState("clear");
          setUsedByPhone(null);
        }
      } catch (err) {
        setCheckState("idle");
        setError("Failed to check reference");
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [reference]);

  async function handleAction(action: "approve" | "reject") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: payment.id,
          reference_number: reference,
          action,
          ticket_count: ticketCount,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Action failed.");
        setBusy(false);
        return;
      }
      setDone(action === "approve" ? "approved" : "rejected");
    } catch (err) {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className={`rounded-2xl border px-6 py-4 flex items-center justify-between ${
          done === "approved"
            ? "bg-[#123522] border-[#22C55E]/40"
            : "bg-[#351722] border-[#EF476F]/40"
        }`}
      >
        <span className="text-[#F5F7FA] text-sm font-medium">
          {payment.customer_name}
        </span>
        <span
          className={`[font-family:var(--font-mono)] text-xs uppercase tracking-wide font-bold ${
            done === "approved" ? "text-[#22C55E]" : "text-[#EF476F]"
          }`}
        >
          {done === "approved" ? "✓ Approved" : "✕ Rejected"}
        </span>
      </div>
    );
  }

  const screenshotSrc = payment.screenshot_url
    ? `/api/payments/screenshot?path=${encodeURIComponent(payment.screenshot_url)}`
    : null;

  const overCapacity = safeMax !== null && ticketCount > safeMax;

  return (
    <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] overflow-hidden md:flex">
      <div className="md:w-52 shrink-0 bg-[#0B111C] flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-[#1C293C] p-5">
        {screenshotSrc ? (
          <>
            <a href={screenshotSrc} target="_blank" rel="noreferrer">
              <img
                src={screenshotSrc}
                alt="Payment screenshot"
                className="max-h-32 rounded-lg object-contain hover:opacity-80 transition"
              />
            </a>
            <a
              href={`/api/payments/screenshot?path=${encodeURIComponent(payment.screenshot_url!)}&download=1`}
              className="text-[10px] text-[#D9A63A] underline"
            >
              Download
            </a>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#172133] flex items-center justify-center text-[#64748B] text-xl">
              🖼️
            </div>
            <p className="text-[#64748B] text-xs [font-family:var(--font-mono)] text-center">
              No screenshot
              <br />
              Check Telegram
            </p>
          </>
        )}
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[#F5F7FA] font-bold text-lg">
                {payment.customer_name}
              </p>
              {rejectionCount >= 3 && (
                <span className="rounded-full bg-[#351722] border border-[#EF476F]/40 text-[#EF476F] text-[10px] font-bold px-2.5 py-1">
                  ⚠ Rejected {rejectionCount}x before
                </span>
              )}
            </div>
            <p className="[font-family:var(--font-mono)] text-sm text-[#9AA7BC] mt-1">
              {payment.phone_number} <span className="text-[#64748B]">•</span>{" "}
              <span className="text-[#D9A63A] uppercase">{payment.method}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#64748B] text-xs mb-1.5">
              {timeAgo(payment.submitted_at)}
            </p>
            <span className="rounded-full bg-[#29164F] text-[#9B5CFF] text-[11px] font-semibold px-3 py-1">
              Waiting
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-center mb-2">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter reference number from screenshot"
            className="flex-1 rounded-lg bg-[#080D16] border border-[#26344A] px-3.5 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8] transition-colors"
          />
          <span className="w-6 text-center">
            {checkState === "checking" && (
              <span className="text-[#64748B]">…</span>
            )}
            {checkState === "clear" && (
              <span className="text-[#22C55E]">✓</span>
            )}
            {checkState === "used" && <span className="text-[#EF476F]">⚠</span>}
          </span>
        </div>

        {checkState === "used" && (
          <p className="text-[#EF476F] text-xs mb-3">
            Already approved under {usedByPhone}
          </p>
        )}
        {error && <p className="text-[#EF476F] text-xs mb-3">{error}</p>}

        <div className="flex items-center gap-3 mt-4 mb-1">
          <label className="text-xs text-[#9AA7BC]">Tickets to grant</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              className="w-8 h-8 rounded-lg bg-[#29164F] text-[#9B5CFF] font-bold hover:bg-[#6D35D8] hover:text-white transition-colors"
            >
              −
            </button>
            <span
              className={`w-10 text-center [font-family:var(--font-mono)] font-bold ${
                overCapacity ? "text-[#EF476F]" : "text-[#F5F7FA]"
              }`}
            >
              {ticketCount}
            </span>
            <button
              type="button"
              onClick={() => setTicketCount(ticketCount + 1)}
              className="w-8 h-8 rounded-lg bg-[#29164F] text-[#9B5CFF] font-bold hover:bg-[#6D35D8] hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>
        {safeMax !== null && (
          <p
            className={`text-[11px] mb-4 ${overCapacity ? "text-[#EF476F]" : "text-[#64748B]"}`}
          >
            {safeMax === 0
              ? "⚠ Sold out — no tickets can currently be approved"
              : `${safeMax} ticket${safeMax !== 1 ? "s" : ""} safely available right now`}
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction("approve")}
            disabled={busy || checkState !== "clear" || overCapacity}
            className="flex items-center gap-1.5 rounded-lg bg-[#123522] border border-[#22C55E]/40 text-[#22C55E] text-sm font-semibold px-4 py-2.5 disabled:opacity-25 hover:bg-[#22C55E] hover:text-white transition-colors"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-[#351722] border border-[#EF476F]/40 text-[#EF476F] text-sm font-semibold px-4 py-2.5 disabled:opacity-25 hover:bg-[#EF476F] hover:text-white transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </div>
  );
}
