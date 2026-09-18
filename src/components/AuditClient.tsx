"use client";

import { useState, useEffect } from "react";

type LogEntry = {
  id: string;
  action: string;
  admin_name: string;
  phone_number: string;
  customer_name: string;
  ticket_count: number | null;
  reference_number: string | null;
  created_at: string;
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AuditClient() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [adminFilter, setAdminFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [adminFilter, actionFilter]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (adminFilter) params.set("admin", adminFilter);
    if (actionFilter) params.set("action", actionFilter);
    if (phoneFilter) params.set("phone", phoneFilter);

    const res = await fetch(`/api/admin/audit?${params.toString()}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setAdmins(data.admins || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  const approvedCount = logs.filter((l) => l.action === "approved").length;
  const rejectedCount = logs.filter((l) => l.action === "rejected").length;

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Accountability
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          Approval audit trail
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Every approve and reject decision, permanently logged with who did it.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 text-center">
          <p className="text-2xl font-bold text-[#F5F7FA]">{logs.length}</p>
          <p className="text-[#9AA7BC] text-xs">Total shown</p>
        </div>
        <div className="rounded-2xl bg-[#123522] border border-[#22C55E]/40 px-5 py-4 text-center">
          <p className="text-2xl font-bold text-[#22C55E]">{approvedCount}</p>
          <p className="text-[#9AA7BC] text-xs">Approved</p>
        </div>
        <div className="rounded-2xl bg-[#351722] border border-[#EF476F]/40 px-5 py-4 text-center">
          <p className="text-2xl font-bold text-[#EF476F]">{rejectedCount}</p>
          <p className="text-[#9AA7BC] text-xs">Rejected</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
          className="rounded-xl bg-[#131C2B] border border-[#26344A] text-[#F5F7FA] text-sm px-4 py-2.5 focus:outline-none focus:border-[#6D35D8]"
        >
          <option value="">All admins</option>
          {admins.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl bg-[#131C2B] border border-[#26344A] text-[#F5F7FA] text-sm px-4 py-2.5 focus:outline-none focus:border-[#6D35D8]"
        >
          <option value="">All actions</option>
          <option value="approved">Approved only</option>
          <option value="rejected">Rejected only</option>
        </select>

        <input
          type="tel"
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
          placeholder="Search phone number"
          className="flex-1 min-w-[160px] rounded-xl bg-[#131C2B] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
        />

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-[#6D35D8] to-[#8B4DFF] text-white text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          🔍 Search
        </button>
      </form>

      {loading ? (
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          Loading...
        </p>
      ) : logs.length === 0 ? (
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          No matching activity found.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`rounded-xl border px-5 py-3 flex flex-wrap items-center gap-3 ${
                log.action === "approved"
                  ? "bg-[#131C2B] border-[#26344A]"
                  : "bg-[#131C2B] border-[#26344A]"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  log.action === "approved"
                    ? "bg-[#123522] text-[#22C55E]"
                    : "bg-[#351722] text-[#EF476F]"
                }`}
              >
                {log.action === "approved" ? "✓" : "✕"}
              </span>

              <div className="flex-1 min-w-[160px]">
                <p className="text-[#F5F7FA] text-sm">
                  <span className="font-semibold">{log.customer_name}</span>{" "}
                  <span className="text-[#64748B]">·</span>{" "}
                  <span className="[font-family:var(--font-mono)] text-[#9AA7BC]">
                    {log.phone_number}
                  </span>
                </p>
                {log.action === "approved" && (
                  <p className="text-[#64748B] text-xs mt-0.5">
                    {log.ticket_count} ticket{log.ticket_count !== 1 ? "s" : ""}{" "}
                    · ref: {log.reference_number || "—"}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-[#8B4DFF] text-sm font-semibold">
                  {log.admin_name}
                </p>
                <p className="text-[#64748B] text-xs">
                  {timeAgo(log.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
