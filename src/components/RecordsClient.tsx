"use client";

import { useState, useEffect } from "react";

type Entry = {
  number: number;
  reference_number: string | null;
  method: string | null;
  assigned_at: string;
};
type Record = { phone_number: string; customer_name: string; entries: Entry[] };

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return (
    d.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " • " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

export default function RecordsClient() {
  const [records, setRecords] = useState<Record[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load(phone?: string) {
    setLoading(true);
    const res = await fetch(
      `/api/admin/records${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`,
    );
    const result = await res.json();
    setRecords(result.records || []);
    setTotalTickets(result.totalTickets || 0);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search.trim());
  }

  function copyRef(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  // Flatten records into one row per ticket entry, matching the reference layout
  const flatRows = records.flatMap((r) =>
    r.entries.map((e) => ({
      ...e,
      phone_number: r.phone_number,
      customer_name: r.customer_name,
    })),
  );

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
            Claimed Tickets
          </p>
          <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
            Claimed tickets
          </h1>
          <p className="text-[#9AA7BC] text-sm">
            View all successfully claimed tickets
          </p>
        </div>
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#29164F] flex items-center justify-center text-[#8B4DFF]">
            📈
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F5F7FA] leading-none">
              {totalTickets}
            </p>
            <p className="text-[#9AA7BC] text-xs mt-1">Numbers claimed</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
            🔍
          </span>
          <input
            type="tel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone number"
            className="w-full rounded-xl bg-[#131C2B] border border-[#26344A] pl-11 pr-4 py-3 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D35D8] to-[#8B4DFF] text-white text-sm font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
        >
          🔍 Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              load();
            }}
            className="rounded-xl border border-[#26344A] text-[#9AA7BC] text-sm px-5 py-3 hover:border-[#6D35D8] transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C293C]">
          <p className="text-[#9AA7BC] text-sm">
            Total results: {flatRows.length}
          </p>
        </div>

        {loading ? (
          <p className="text-[#64748B] text-sm [font-family:var(--font-mono)] px-6 py-10 text-center">
            Loading...
          </p>
        ) : flatRows.length === 0 ? (
          <p className="text-[#64748B] text-sm [font-family:var(--font-mono)] px-6 py-10 text-center">
            {search
              ? "No record for that phone number."
              : "No tickets claimed yet."}
          </p>
        ) : (
          <div className="divide-y divide-[#1C293C]">
            {flatRows.map((row, i) => {
              const key = `${row.phone_number}-${row.number}-${i}`;
              const expanded = expandedKey === key;
              return (
                <div key={key}>
                  <button
                    onClick={() => setExpandedKey(expanded ? null : key)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#172133] transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#29164F] flex items-center justify-center text-[#8B4DFF] shrink-0">
                      🎫
                    </div>

                    <div className="w-24 shrink-0">
                      <p className="[font-family:var(--font-fraunces)] text-lg font-bold text-[#D9A63A]">
                        #{row.number}
                      </p>
                    </div>

                    <div className="w-40 shrink-0">
                      <p className="[font-family:var(--font-mono)] text-sm text-[#F5F7FA]">
                        {row.phone_number}
                      </p>
                      <p className="text-[#64748B] text-xs mt-0.5">
                        📅 {formatDate(row.assigned_at)}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0 hidden md:block">
                      <p className="text-[#64748B] text-[10px] uppercase tracking-wide">
                        Reference Number
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="[font-family:var(--font-mono)] text-sm text-[#F5F7FA] truncate">
                          {row.reference_number || "—"}
                        </p>
                        {row.reference_number && (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyRef(row.reference_number!, key);
                            }}
                            className="text-[#8B4DFF] text-xs shrink-0 hover:text-[#F5F7FA] transition-colors"
                          >
                            {copiedKey === key ? "✓" : "⧉"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:block shrink-0">
                      <p className="text-[#64748B] text-[10px] uppercase tracking-wide">
                        Payment Method
                      </p>
                      <p className="text-[#F5F7FA] text-sm font-medium uppercase">
                        {row.method || "—"}
                      </p>
                    </div>

                    <div className="shrink-0 ml-auto flex items-center gap-3">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#123522] border border-[#22C55E]/40 text-[#22C55E] text-xs font-semibold px-3.5 py-1.5">
                        ✓ Claimed
                      </span>
                      <span
                        className={`text-[#64748B] transition-transform ${expanded ? "rotate-90" : ""}`}
                      >
                        ›
                      </span>
                    </div>
                  </button>

                  <div className={`expand-panel ${expanded ? "open" : ""}`}>
                    <div className="px-6 pb-4 md:hidden">
                      <div className="rounded-xl bg-[#0B111C] border border-[#1C293C] p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B] text-xs">
                            Reference
                          </span>
                          <span className="[font-family:var(--font-mono)] text-xs text-[#F5F7FA]">
                            {row.reference_number || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B] text-xs">Method</span>
                          <span className="text-[#F5F7FA] text-xs uppercase">
                            {row.method || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#64748B] text-xs">
                            Customer
                          </span>
                          <span className="text-[#F5F7FA] text-xs">
                            {row.customer_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
