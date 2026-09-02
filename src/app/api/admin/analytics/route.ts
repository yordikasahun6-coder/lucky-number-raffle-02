import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days")) || 7;

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - days + 1);
  rangeStart.setHours(0, 0, 0, 0);

  const prevRangeStart = new Date(rangeStart);
  prevRangeStart.setDate(prevRangeStart.getDate() - days);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const { data: settingsRow } = await supabaseAdmin
    .from("app_settings")
    .select("ticket_price, currency")
    .limit(1)
    .single();
  const ticketPrice = settingsRow?.ticket_price || 0;
  const currency = settingsRow?.currency || "ETB";

  const { data: allPayments } = await supabaseAdmin
    .from("payments")
    .select(
      "status, ticket_count, refunded_count, method, phone_number, customer_name, submitted_at, reviewed_at",
    );

  const payments = allPayments || [];

  const inRange = (dateStr: string | null, start: Date, end?: Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= start && (!end || d < end);
  };

  // ---- Top stat cards ----
  const todayApprovals = payments.filter(
    (p) => p.status === "approved" && inRange(p.reviewed_at, todayStart),
  ).length;
  const yesterdayApprovals = payments.filter(
    (p) =>
      p.status === "approved" &&
      inRange(p.reviewed_at, yesterdayStart, todayStart),
  ).length;
  const totalApprovals = payments.filter((p) => p.status === "approved").length;

  const todayRejected = payments.filter(
    (p) => p.status === "rejected" && inRange(p.reviewed_at, todayStart),
  ).length;
  const yesterdayRejected = payments.filter(
    (p) =>
      p.status === "rejected" &&
      inRange(p.reviewed_at, yesterdayStart, todayStart),
  ).length;
  const totalRejected = payments.filter((p) => p.status === "rejected").length;

  const collectedFor = (p: any) => (p.ticket_count || 0) * ticketPrice;
  const todayCollected = payments
    .filter(
      (p) => p.status === "approved" && inRange(p.reviewed_at, todayStart),
    )
    .reduce((s, p) => s + collectedFor(p), 0);
  const yesterdayCollected = payments
    .filter(
      (p) =>
        p.status === "approved" &&
        inRange(p.reviewed_at, yesterdayStart, todayStart),
    )
    .reduce((s, p) => s + collectedFor(p), 0);
  const totalCollected = payments
    .filter((p) => p.status === "approved")
    .reduce((s, p) => s + collectedFor(p), 0);

  const last30Start = new Date();
  last30Start.setDate(last30Start.getDate() - 30);
  const prev30Start = new Date();
  prev30Start.setDate(prev30Start.getDate() - 60);

  const last30Approvals = payments.filter(
    (p) => p.status === "approved" && inRange(p.reviewed_at, last30Start),
  ).length;
  const prev30Approvals = payments.filter(
    (p) =>
      p.status === "approved" &&
      inRange(p.reviewed_at, prev30Start, last30Start),
  ).length;
  const last30Collected = payments
    .filter(
      (p) => p.status === "approved" && inRange(p.reviewed_at, last30Start),
    )
    .reduce((s, p) => s + collectedFor(p), 0);
  const prev30Collected = payments
    .filter(
      (p) =>
        p.status === "approved" &&
        inRange(p.reviewed_at, prev30Start, last30Start),
    )
    .reduce((s, p) => s + collectedFor(p), 0);
  const last30Rejected = payments.filter(
    (p) => p.status === "rejected" && inRange(p.reviewed_at, last30Start),
  ).length;
  const prev30Rejected = payments.filter(
    (p) =>
      p.status === "rejected" &&
      inRange(p.reviewed_at, prev30Start, last30Start),
  ).length;

  const pctChange = (curr: number, prev: number) =>
    prev === 0
      ? curr > 0
        ? 100
        : 0
      : Math.round(((curr - prev) / prev) * 1000) / 10;

  // ---- Daily series for charts ----
  const dailyMap: Record<
    string,
    { approved: number; rejected: number; collected: number }
  > = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    dailyMap[dayKey(d)] = { approved: 0, rejected: 0, collected: 0 };
  }
  for (const p of payments) {
    if (!p.reviewed_at) continue;
    const k = dayKey(new Date(p.reviewed_at));
    if (!dailyMap[k]) continue;
    if (p.status === "approved") {
      dailyMap[k].approved += 1;
      dailyMap[k].collected += collectedFor(p);
    }
    if (p.status === "rejected") dailyMap[k].rejected += 1;
  }
  const dailySeries = Object.entries(dailyMap).map(([date, v]) => ({
    date,
    ...v,
  }));

  // ---- Payment method distribution ----
  const methodMap: Record<string, number> = {};
  for (const p of payments.filter((p) => p.status === "approved")) {
    const m = p.method || "Other";
    methodMap[m] = (methodMap[m] || 0) + collectedFor(p);
  }
  const methodDistribution = Object.entries(methodMap)
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total);

  // ---- Top customers by tickets purchased ----
  const customerMap: Record<
    string,
    { name: string; phone: string; tickets: number }
  > = {};
  for (const p of payments.filter((p) => p.status === "approved")) {
    if (!customerMap[p.phone_number])
      customerMap[p.phone_number] = {
        name: p.customer_name,
        phone: p.phone_number,
        tickets: 0,
      };
    customerMap[p.phone_number].tickets += p.ticket_count || 0;
  }
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5);

  // ---- Recent activity ----
  type Activity = {
    type: "approved" | "rejected" | "submitted";
    phone: string;
    detail: string;
    time: string;
  };
  const activity: Activity[] = [];
  for (const p of payments) {
    if (p.reviewed_at && p.status === "approved") {
      activity.push({
        type: "approved",
        phone: p.phone_number,
        detail: `${p.ticket_count} ticket${p.ticket_count !== 1 ? "s" : ""}`,
        time: p.reviewed_at,
      });
    }
    if (p.reviewed_at && p.status === "rejected") {
      activity.push({
        type: "rejected",
        phone: p.phone_number,
        detail: `${p.ticket_count} ticket${p.ticket_count !== 1 ? "s" : ""}`,
        time: p.reviewed_at,
      });
    }
    if (p.submitted_at) {
      activity.push({
        type: "submitted",
        phone: p.phone_number,
        detail: `via ${p.method}`,
        time: p.submitted_at,
      });
    }
  }
  activity.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );
  const recentActivity = activity.slice(0, 10);

  // ---- Summary ----
  const approvedInRange = payments.filter(
    (p) => p.status === "approved" && inRange(p.reviewed_at, rangeStart),
  );
  const rejectedInRange = payments.filter(
    (p) => p.status === "rejected" && inRange(p.reviewed_at, rangeStart),
  );
  const avgApprovalMs =
    approvedInRange.length > 0
      ? approvedInRange.reduce(
          (s, p) =>
            s +
            (new Date(p.reviewed_at!).getTime() -
              new Date(p.submitted_at).getTime()),
          0,
        ) / approvedInRange.length
      : 0;
  const avgApprovalHours = Math.floor(avgApprovalMs / 3600000);
  const avgApprovalMinutes = Math.floor((avgApprovalMs % 3600000) / 60000);

  const ticketsInRange = approvedInRange.reduce(
    (s, p) => s + (p.ticket_count || 0),
    0,
  );
  const collectedInRange = approvedInRange.reduce(
    (s, p) => s + collectedFor(p),
    0,
  );
  const rejectionRate =
    approvedInRange.length + rejectedInRange.length > 0
      ? Math.round(
          (rejectedInRange.length /
            (approvedInRange.length + rejectedInRange.length)) *
            1000,
        ) / 10
      : 0;

  return NextResponse.json({
    currency,
    stats: {
      todayApprovals,
      approvalsVsYesterday: pctChange(todayApprovals, yesterdayApprovals),
      totalApprovals,
      approvalsVsLast30: pctChange(last30Approvals, prev30Approvals),
      todayCollected,
      collectedVsYesterday: pctChange(todayCollected, yesterdayCollected),
      totalCollected,
      collectedVsLast30: pctChange(last30Collected, prev30Collected),
      todayRejected,
      rejectedVsYesterday: pctChange(todayRejected, yesterdayRejected),
      totalRejected,
      rejectedVsLast30: pctChange(last30Rejected, prev30Rejected),
    },
    dailySeries,
    methodDistribution,
    topCustomers,
    recentActivity,
    summary: {
      avgApprovalTime: `${avgApprovalHours}h ${avgApprovalMinutes}m`,
      ticketsPerDay: Math.round(ticketsInRange / days),
      collectionPerDay: Math.round(collectedInRange / days),
      rejectionRate,
    },
  });
}
