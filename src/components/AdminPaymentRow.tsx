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

export default function AdminPaymentRow({ payment }: { payment: Payment }) {
  const [reference, setReference] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [checkState, setCheckState] = useState<
    "idle" | "checking" | "clear" | "used"
  >("idle");
  const [usedByPhone, setUsedByPhone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (reference.trim().length === 0) {
      setCheckState("idle");
      return;
    }
    setCheckState("checking");
    debounceRef.current = setTimeout(async () => {
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
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [reference]);

  async function handleAction(action: "approve" | "reject") {
    setBusy(true);
    setError("");
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
  }

  if (done) {
    return (
      <div
        className={`rounded border-l-2 ${done === "approved" ? "border-[#4FBF8B]" : "border-[#E15B4F]"} bg-[#141B29] px-5 py-4 flex items-center justify-between`}
      >
        <span className="text-[#EDEFF3] text-sm">{payment.customer_name}</span>
        <span
          className={`[font-family:var(--font-mono)] text-xs uppercase tracking-wide ${done === "approved" ? "text-[#4FBF8B]" : "text-[#E15B4F]"}`}
        >
          {done === "approved" ? "Approved" : "Rejected"}
        </span>
      </div>
    );
  }

  const screenshotSrc = payment.screenshot_url
    ? `/api/payments/screenshot?path=${encodeURIComponent(payment.screenshot_url)}`
    : null;

  return (
    <div className="rounded bg-[#141B29] border border-[#232D42] overflow-hidden md:flex">
      <div className="md:w-40 shrink-0 bg-[#0B0F17] flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-dashed border-[#2C3750] p-3">
        {screenshotSrc ? (
          <>
            <a href={screenshotSrc} target="_blank" rel="noreferrer">
              <img
                src={screenshotSrc}
                alt="Payment screenshot"
                className="max-h-28 rounded object-contain hover:opacity-80 transition"
              />
            </a>
            <a
              href={`/api/payments/screenshot?path=${encodeURIComponent(payment.screenshot_url!)}&download=1`}
              className="text-[10px] text-[#D4A24C] underline"
            >
              Download
            </a>
          </>
        ) : (
          <span className="text-[#4A5468] text-xs [font-family:var(--font-mono)] text-center">
            no screenshot
            <br />
            check telegram
          </span>
        )}
      </div>

      <div className="flex-1 p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#EDEFF3] font-medium">
              {payment.customer_name}
            </p>
            <p className="[font-family:var(--font-mono)] text-sm text-[#7C879C] mt-0.5">
              {payment.phone_number} ·{" "}
              <span className="text-[#D4A24C] uppercase">{payment.method}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center mb-2">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Reference number from screenshot"
            className="flex-1 rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 [font-family:var(--font-mono)] text-[#EDEFF3] text-sm placeholder-[#4A5468] focus:outline-none focus:border-[#D4A24C]"
          />
          <span className="w-6 text-center">
            {checkState === "checking" && (
              <span className="text-[#4A5468]">…</span>
            )}
            {checkState === "clear" && (
              <span className="text-[#4FBF8B]">✓</span>
            )}
            {checkState === "used" && <span className="text-[#E15B4F]">⚠</span>}
          </span>
        </div>

        {checkState === "used" && (
          <p className="text-[#E15B4F] text-xs mb-3">
            Already approved under {usedByPhone}
          </p>
        )}
        {error && <p className="text-[#E15B4F] text-xs mb-3">{error}</p>}

        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-[#7C879C]">Tickets to grant:</label>
          <input
            type="number"
            min="1"
            value={ticketCount}
            onChange={(e) =>
              setTicketCount(Math.max(1, Number(e.target.value)))
            }
            className="w-16 rounded bg-[#0B0F17] border border-[#232D42] px-2 py-1 [font-family:var(--font-mono)] text-[#EDEFF3] text-sm text-center"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction("approve")}
            disabled={busy || checkState !== "clear"}
            className="rounded bg-[#D4A24C] text-[#0B0F17] text-sm font-medium px-4 py-2 disabled:opacity-25 hover:bg-[#E0AF5C] transition"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={busy}
            className="rounded bg-transparent border border-[#232D42] text-[#7C879C] text-sm font-medium px-4 py-2 disabled:opacity-25 hover:border-[#E15B4F] hover:text-[#E15B4F] transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
