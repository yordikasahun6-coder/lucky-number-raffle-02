"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type AnalyticsData = {
  currency: string;
  stats: {
    todayApprovals: number;
    approvalsVsYesterday: number;
    totalApprovals: number;
    approvalsVsLast30: number;
    todayCollected: number;
    collectedVsYesterday: number;
    totalCollected: number;
    collectedVsLast30: number;
    todayRejected: number;
    rejectedVsYesterday: number;
    totalRejected: number;
    rejectedVsLast30: number;
  };
  dailySeries: {
    date: string;
    approved: number;
    rejected: number;
    collected: number;
  }[];
  methodDistribution: { method: string; total: number }[];
  topCustomers: { name: string; phone: string; tickets: number }[];
  recentActivity: {
    type: string;
    phone: string;
    detail: string;
    time: string;
  }[];
  summary: {
    avgApprovalTime: string;
    ticketsPerDay: number;
    collectionPerDay: number;
    rejectionRate: number;
  };
};

const PIE_COLORS = ["#7C3AED", "#3B82F6", "#D9A63A", "#64748B", "#EF476F"];

function formatDate(d: any) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`text-xs font-semibold ${positive ? "text-[#22C55E]" : "text-[#EF476F]"}`}
    >
      {positive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

export default function AnalyticsClient() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [days]);

  if (loading || !data) {
    return (
      <main className="px-6 py-8 md:px-10 md:py-10">
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          Loading analytics...
        </p>
      </main>
    );
  }

  const {
    currency,
    stats,
    dailySeries,
    methodDistribution,
    topCustomers,
    recentActivity,
    summary,
  } = data;
  const methodTotal = methodDistribution.reduce((s, m) => s + m.total, 0);

  const statCards = [
    {
      label: "Today's Approval",
      value: stats.todayApprovals,
      delta: stats.approvalsVsYesterday,
      deltaLabel: "vs yesterday",
      icon: "📋",
      bg: "#29164F",
      fg: "#8B4DFF",
    },
    {
      label: "Total Approval",
      value: stats.totalApprovals,
      delta: stats.approvalsVsLast30,
      deltaLabel: "vs last 30 days",
      icon: "✓",
      bg: "#0d3a52",
      fg: "#3B82F6",
    },
    {
      label: "Today's Collected",
      value: `${currency} ${stats.todayCollected.toLocaleString()}`,
      delta: stats.collectedVsYesterday,
      deltaLabel: "vs yesterday",
      icon: "$",
      bg: "#123522",
      fg: "#22C55E",
    },
    {
      label: "Total Collected",
      value: `${currency} ${stats.totalCollected.toLocaleString()}`,
      delta: stats.collectedVsLast30,
      deltaLabel: "vs last 30 days",
      icon: "💼",
      bg: "#3A2E10",
      fg: "#D9A63A",
    },
    {
      label: "Today's Rejected",
      value: stats.todayRejected,
      delta: -stats.rejectedVsYesterday,
      deltaLabel: "vs yesterday",
      icon: "✕",
      bg: "#351722",
      fg: "#EF476F",
    },
    {
      label: "Total Rejected",
      value: stats.totalRejected,
      delta: -stats.rejectedVsLast30,
      deltaLabel: "vs last 30 days",
      icon: "🛡",
      bg: "#351722",
      fg: "#EF476F",
    },
  ];

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
            Analytics
          </p>
          <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">Overview</h1>
          <p className="text-[#9AA7BC] text-sm">
            Track your ticket system performance and key metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl bg-[#131C2B] border border-[#26344A] text-[#F5F7FA] text-sm px-4 py-2.5 focus:outline-none focus:border-[#6D35D8]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: c.bg, color: c.fg }}
              >
                {c.icon}
              </span>
              <p className="text-[#64748B] text-[10px] uppercase tracking-wide font-semibold">
                {c.label}
              </p>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA] mb-1">{c.value}</p>
            <div className="flex items-center gap-1.5">
              <Delta value={c.delta} />
              <span className="text-[#64748B] text-[10px]">{c.deltaLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-1 rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-4">
            Approval vs Rejected
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailySeries}>
              <defs>
                <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF476F" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#EF476F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#26344A"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#64748B"
                fontSize={11}
              />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0B111C",
                  border: "1px solid #26344A",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={formatDate}
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke="#22C55E"
                fill="url(#approvedGrad)"
                strokeWidth={2}
                name="Approved"
              />
              <Area
                type="monotone"
                dataKey="rejected"
                stroke="#EF476F"
                fill="url(#rejectedGrad)"
                strokeWidth={2}
                name="Rejected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-4">
            Collections Overview
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailySeries}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#26344A"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#64748B"
                fontSize={11}
              />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0B111C",
                  border: "1px solid #26344A",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={formatDate}
                formatter={(v: any) => [
                  `${currency} ${Number(v).toLocaleString()}`,
                  "Collected",
                ]}
              />
              <Bar dataKey="collected" fill="#D9A63A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-4">Payment Methods</p>
          {methodDistribution.length === 0 ? (
            <p className="text-[#64748B] text-sm">No approved payments yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={methodDistribution}
                    dataKey="total"
                    nameKey="method"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {methodDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {methodDistribution.map((m, i) => (
                  <div
                    key={m.method}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-[#F5F7FA]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      {m.method}
                    </span>
                    <span className="text-[#9AA7BC]">
                      {methodTotal > 0
                        ? Math.round((m.total / methodTotal) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-4">Recent Activity</p>
          {recentActivity.length === 0 ? (
            <p className="text-[#64748B] text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                    style={{
                      backgroundColor:
                        a.type === "approved"
                          ? "#123522"
                          : a.type === "rejected"
                            ? "#351722"
                            : "#3A2E10",
                      color:
                        a.type === "approved"
                          ? "#22C55E"
                          : a.type === "rejected"
                            ? "#EF476F"
                            : "#D9A63A",
                    }}
                  >
                    {a.type === "approved"
                      ? "✓"
                      : a.type === "rejected"
                        ? "✕"
                        : "$"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F7FA] text-xs font-medium">
                      {a.type === "approved"
                        ? "Ticket Approved"
                        : a.type === "rejected"
                          ? "Ticket Rejected"
                          : "Payment Received"}
                    </p>
                    <p className="text-[#64748B] text-[11px] [font-family:var(--font-mono)]">
                      {a.phone} ({a.detail})
                    </p>
                  </div>
                  <span className="text-[#64748B] text-[10px] shrink-0">
                    {timeAgo(a.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-1">Top Customers</p>
          <p className="text-[#64748B] text-xs mb-4">By tickets purchased</p>
          {topCustomers.length === 0 ? (
            <p className="text-[#64748B] text-sm">No approved customers yet.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={c.phone} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#29164F] text-[#8B4DFF] text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F7FA] text-xs font-medium truncate">
                      {c.name}
                    </p>
                    <p className="text-[#64748B] text-[11px] [font-family:var(--font-mono)]">
                      {c.phone}
                    </p>
                  </div>
                  <span className="[font-family:var(--font-fraunces)] font-bold text-[#D9A63A] text-sm shrink-0">
                    {c.tickets}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-5">
          <p className="text-[#F5F7FA] font-semibold mb-4">Summary</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#29164F] flex items-center justify-center text-[#8B4DFF] text-sm shrink-0">
                ⏱
              </span>
              <span className="text-[#9AA7BC] text-xs flex-1">
                Average approval time
              </span>
              <span className="text-[#F5F7FA] text-sm font-semibold">
                {summary.avgApprovalTime}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#0d3a52] flex items-center justify-center text-[#3B82F6] text-sm shrink-0">
                📊
              </span>
              <span className="text-[#9AA7BC] text-xs flex-1">
                Tickets per day (avg)
              </span>
              <span className="text-[#F5F7FA] text-sm font-semibold">
                {summary.ticketsPerDay}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#123522] flex items-center justify-center text-[#22C55E] text-sm shrink-0">
                $
              </span>
              <span className="text-[#9AA7BC] text-xs flex-1">
                Collection per day (avg)
              </span>
              <span className="text-[#F5F7FA] text-sm font-semibold">
                {currency} {summary.collectionPerDay.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#351722] flex items-center justify-center text-[#EF476F] text-sm shrink-0">
                🛡
              </span>
              <span className="text-[#9AA7BC] text-xs flex-1">
                Rejection rate
              </span>
              <span className="text-[#F5F7FA] text-sm font-semibold">
                {summary.rejectionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
