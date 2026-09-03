import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminPaymentRow from "@/components/AdminPaymentRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: approvedToday } = await supabaseAdmin
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("reviewed_at", todayStart.toISOString());

  const { count: rejectedToday } = await supabaseAdmin
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected")
    .gte("reviewed_at", todayStart.toISOString());

  const { data: approvedTodayRows } = await supabaseAdmin
    .from("payments")
    .select("ticket_count")
    .eq("status", "approved")
    .gte("reviewed_at", todayStart.toISOString());

  const { data: settingsRow } = await supabaseAdmin
    .from("app_settings")
    .select("ticket_price, currency")
    .limit(1)
    .single();

  const ticketPrice = settingsRow?.ticket_price || 0;
  const currency = settingsRow?.currency || "ETB";
  const totalValueToday = (approvedTodayRows || []).reduce(
    (sum, r) => sum + r.ticket_count * ticketPrice,
    0,
  );

  const { count: claimedCount } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken");

  const totalRevenue = (claimedCount || 0) * ticketPrice;

  const count = payments?.length || 0;

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#29164F] flex items-center justify-center text-lg">
            🧑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F7FA]">
              Pending claims
            </h1>
            <p className="text-[#9AA7BC] text-sm">
              Review and approve ticket claims from users
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-11 h-11 rounded-xl bg-[#131C2B] border border-[#26344A] flex items-center justify-center text-[#9AA7BC]">
            🔔
          </button>
          <div className="rounded-xl bg-[#131C2B] border border-[#26344A] px-5 py-2.5 flex items-center gap-3">
            <div>
              <p className="text-[#D9A63A] text-xl font-bold leading-none">
                {count}
              </p>
              <p className="text-[#9AA7BC] text-xs mt-1">Waiting for review</p>
            </div>
            <span className="text-[#D9A63A] text-lg">⏱</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="rounded-2xl bg-[#29164F] border border-[#6D35D8]/40 px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6D35D8] flex items-center justify-center text-white">
            📋
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-[#C9B8EE] text-xs">Pending claims</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#123522] flex items-center justify-center text-[#22C55E]">
            ✓
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F5F7FA]">
              {approvedToday || 0}
            </p>
            <p className="text-[#9AA7BC] text-xs">Approved today</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#351722] flex items-center justify-center text-[#EF476F]">
            ✕
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F5F7FA]">
              {rejectedToday || 0}
            </p>
            <p className="text-[#9AA7BC] text-xs">Rejected today</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3A2E10] flex items-center justify-center text-[#D9A63A]">
            🎫
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F5F7FA]">
              {currency} {totalValueToday}
            </p>
            <p className="text-[#9AA7BC] text-xs">Total value today</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#24134A] to-[#131C2B] border border-[#7C3AED]/40 px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center text-[#9B4DFF]">
            💰
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F5F7FA]">
              {currency} {totalRevenue.toLocaleString()}
            </p>
            <p className="text-[#9AA7BC] text-xs">Total collected</p>
          </div>
        </div>
      </div>

      {count === 0 ? (
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-6 py-16 text-center">
          <p className="text-[#64748B] [font-family:var(--font-mono)] text-sm">
            — queue is empty —
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments!.map((p) => (
            <AdminPaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}
    </main>
  );
}
