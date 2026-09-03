"use client";

import { useState, useEffect } from "react";

type Payment = {
  id: string;
  customer_name: string;
  phone_number: string;
  method: string;
  reference_number: string | null;
  ticket_count: number;
  refunded_count: number;
  claimedCount: number;
  unclaimedCount: number;
  claimedNumbers: number[];
  submitted_at: string;
  daysSinceApproval?: number;
};

type Stats = {
  totalApprovedPayments: number;
  totalTicketsSold: number;
  totalRefunded: number;
  totalUnclaimed: number;
  uniqueUnclaimedCustomers: number;
};

export default function LedgerClient() {
  const [view, setView] = useState<"search" | "unclaimed">("search");
  const [phone, setPhone] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [refundAmounts, setRefundAmounts] = useState<Record<string, number>>(
    {},
  );
  const [refunding, setRefunding] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const res = await fetch("/api/admin/ledger/stats");
    const data = await res.json();
    if (res.ok) setStats(data);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(
      `/api/admin/ledger?phone=${encodeURIComponent(phone.trim())}`,
    );
    const result = await res.json();
    setPayments(result.payments || []);
    setSearched(true);
    setLoading(false);
  }

  async function loadUnclaimed() {
    setView("unclaimed");
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/ledger/unclaimed");
    const result = await res.json();
    setPayments(result.payments || []);
    setSearched(true);
    setLoading(false);
  }

  async function handleRefund(paymentId: string) {
    const amount = refundAmounts[paymentId] || 1;
    setRefunding(paymentId);
    setError("");

    const res = await fetch("/api/admin/ledger/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId, refund_amount: amount }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Refund failed.");
      setRefunding(null);
      return;
    }

    if (view === "unclaimed") await loadUnclaimed();
    else await handleSearch({ preventDefault: () => {} } as React.FormEvent);
    await loadStats();
    setRefunding(null);
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Customer Ledger
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          Search & Refund
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Find any approved customer, review their tickets, refund unclaimed
          portions, or browse who still needs to claim.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#29164F] flex items-center justify-center text-[#8B4DFF]">
              📋
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F7FA]">
                {stats.totalApprovedPayments}
              </p>
              <p className="text-[#9AA7BC] text-xs">Approved payments</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123522] flex items-center justify-center text-[#22C55E]">
              🎟️
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F7FA]">
                {stats.totalTicketsSold}
              </p>
              <p className="text-[#9AA7BC] text-xs">Tickets sold</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#351722] flex items-center justify-center text-[#EF476F]">
              ↩
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F7FA]">
                {stats.totalRefunded}
              </p>
              <p className="text-[#9AA7BC] text-xs">Refunded</p>
            </div>
          </div>
          <button
            onClick={loadUnclaimed}
            className="rounded-2xl bg-gradient-to-br from-[#3A2E10] to-[#131C2B] border border-[#D9A63A]/40 px-5 py-5 flex items-center gap-3 text-left hover:border-[#D9A63A] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#D9A63A]/20 flex items-center justify-center text-[#D9A63A]">
              ⏳
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F7FA]">
                {stats.totalUnclaimed}
              </p>
              <p className="text-[#9AA7BC] text-xs">Unclaimed tickets</p>
            </div>
          </button>
          <button
            onClick={loadUnclaimed}
            className="rounded-2xl bg-gradient-to-br from-[#24134A] to-[#131C2B] border border-[#7C3AED]/40 px-5 py-5 flex items-center gap-3 text-left hover:border-[#7C3AED] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center text-[#9B4DFF]">
              📞
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F7FA]">
                {stats.uniqueUnclaimedCustomers}
              </p>
              <p className="text-[#9AA7BC] text-xs">Need reminding</p>
            </div>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            setView("search");
            setSearched(false);
            setPayments([]);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "search"
              ? "bg-[#6D35D8] text-white"
              : "bg-[#131C2B] text-[#9AA7BC] border border-[#26344A]"
          }`}
        >
          🔍 Search by phone
        </button>
        <button
          onClick={loadUnclaimed}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "unclaimed"
              ? "bg-[#D9A63A] text-[#0B111C]"
              : "bg-[#131C2B] text-[#9AA7BC] border border-[#26344A]"
          }`}
        >
          ⏳ Browse unclaimed ({stats?.totalUnclaimed || 0})
        </button>
      </div>

      {view === "search" && (
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
              🔍
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Search by phone number"
              className="w-full rounded-xl bg-[#131C2B] border border-[#26344A] pl-11 pr-4 py-3 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D35D8] to-[#8B4DFF] text-white text-sm font-semibold px-6 py-3 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? "..." : "🔍 Search"}
          </button>
        </form>
      )}

      {error && <p className="text-[#EF476F] text-sm mb-4">{error}</p>}

      {searched && payments.length === 0 && !loading && (
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          {view === "unclaimed"
            ? "Nobody has unclaimed tickets right now."
            : "No approved payments found for that phone number."}
        </p>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-[#F5F7FA] font-bold text-lg">
                  {p.customer_name}
                </p>
                <p className="[font-family:var(--font-mono)] text-sm text-[#9AA7BC]">
                  {p.phone_number} <span className="text-[#64748B]">•</span>{" "}
                  <span className="text-[#D9A63A] uppercase">{p.method}</span>
                </p>
                <p className="text-[#64748B] text-xs mt-1">
                  Ref: {p.reference_number || "—"}{" "}
                  <span className="mx-1">•</span>{" "}
                  {new Date(p.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {view === "unclaimed" && p.daysSinceApproval !== undefined && (
                  <span
                    className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
                      p.daysSinceApproval >= 7
                        ? "bg-[#351722] border border-[#EF476F]/40 text-[#EF476F]"
                        : "bg-[#3A2E10] border border-[#D9A63A]/40 text-[#D9A63A]"
                    }`}
                  >
                    {p.daysSinceApproval === 0
                      ? "Approved today"
                      : `${p.daysSinceApproval}d since approval`}
                  </span>
                )}
                {p.refunded_count > 0 && (
                  <span className="rounded-full bg-[#351722] border border-[#EF476F]/40 text-[#EF476F] text-xs font-semibold px-3 py-1.5">
                    {p.refunded_count} refunded
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#F5F7FA]">
                  {p.ticket_count}
                </p>
                <p className="text-[#64748B] text-xs">Total tickets</p>
              </div>
              <div className="rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#22C55E]">
                  {p.claimedCount}
                </p>
                <p className="text-[#64748B] text-xs">Claimed</p>
              </div>
              <div className="rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#D9A63A]">
                  {p.unclaimedCount}
                </p>
                <p className="text-[#64748B] text-xs">Unclaimed</p>
              </div>
            </div>

            {p.claimedNumbers && p.claimedNumbers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.claimedNumbers.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-[#123522] text-[#22C55E] text-xs font-semibold px-2.5 py-1"
                  >
                    #{n}
                  </span>
                ))}
              </div>
            )}

            {p.unclaimedCount > 0 ? (
              <div className="rounded-xl bg-[#351722]/40 border border-[#EF476F]/30 p-4 flex flex-wrap items-center gap-3">
                <span className="text-[#F5B8C6] text-sm flex-1 min-w-[180px]">
                  Refund unclaimed tickets — releases them back for others to
                  buy.
                </span>
                <input
                  type="number"
                  min="1"
                  max={p.unclaimedCount}
                  value={refundAmounts[p.id] ?? 1}
                  onChange={(e) =>
                    setRefundAmounts({
                      ...refundAmounts,
                      [p.id]: Math.min(
                        p.unclaimedCount,
                        Math.max(1, Number(e.target.value)),
                      ),
                    })
                  }
                  className="w-16 rounded-lg bg-[#080D16] border border-[#26344A] px-2 py-2 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm text-center"
                />
                <button
                  onClick={() => handleRefund(p.id)}
                  disabled={refunding === p.id}
                  className="rounded-lg bg-[#EF476F] text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 hover:bg-[#c93a5c] transition-colors"
                >
                  {refunding === p.id ? "Refunding..." : "↩ Refund"}
                </button>
              </div>
            ) : (
              <p className="text-[#64748B] text-xs">
                All tickets from this payment have been claimed.
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
