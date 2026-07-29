"use client";

import { useState, useEffect } from "react";

type Entry = {
  number: number;
  reference_number: string | null;
  method: string | null;
  assigned_at: string;
};
type Record = { phone_number: string; customer_name: string; entries: Entry[] };

export default function RecordsClient() {
  const [records, setRecords] = useState<Record[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-6 border-b border-[#232D42] pb-6">
          <div>
            <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
              Draw day
            </p>
            <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3]">
              Claimed tickets
            </h1>
          </div>
          <div className="text-right">
            <p className="[font-family:var(--font-mono)] text-3xl text-[#D4A24C]">
              {totalTickets}
            </p>
            <p className="text-xs text-[#7C879C]">numbers claimed</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="tel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone number"
            className="flex-1 rounded bg-[#141B29] border border-[#232D42] px-4 py-2.5 [font-family:var(--font-mono)] text-[#EDEFF3] text-sm placeholder-[#4A5468] focus:outline-none focus:border-[#D4A24C]"
          />
          <button
            type="submit"
            className="rounded bg-[#D4A24C] text-[#0B0F17] text-sm font-medium px-5 py-2.5"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                load();
              }}
              className="rounded border border-[#232D42] text-[#7C879C] text-sm px-4 py-2.5"
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <p className="text-[#7C879C] text-sm [font-family:var(--font-mono)]">
            Loading...
          </p>
        ) : records.length === 0 ? (
          <p className="text-[#7C879C] text-sm [font-family:var(--font-mono)]">
            {search
              ? "No record for that phone number."
              : "No tickets claimed yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.phone_number}
                className="rounded bg-[#141B29] border border-[#232D42] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#EDEFF3] font-medium">
                      {r.customer_name}
                    </p>
                    <p className="[font-family:var(--font-mono)] text-sm text-[#7C879C]">
                      {r.phone_number}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#4FBF8B]/10 text-[#4FBF8B] text-xs font-medium px-3 py-1">
                    {r.entries.length} ticket{r.entries.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-2">
                  {r.entries.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded bg-[#0B0F17] px-3 py-2 [font-family:var(--font-mono)] text-xs"
                    >
                      <span className="text-[#D4A24C] font-bold text-sm">
                        #{e.number}
                      </span>
                      <span className="text-[#7C879C]">
                        ref: {e.reference_number || "—"}
                      </span>
                      <span className="text-[#7C879C] uppercase">
                        {e.method || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
