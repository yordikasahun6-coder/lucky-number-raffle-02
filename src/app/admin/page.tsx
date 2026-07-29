import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminPaymentRow from "@/components/AdminPaymentRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  const count = payments?.length || 0;

  return (
    <main className="min-h-screen bg-[#0B0F17] px-4 py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-10 border-b border-[#232D42] pb-6">
          <div>
            <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
              Review desk
            </p>
            <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3]">
              Pending claims
            </h1>
          </div>
          <div className="text-right">
            <p className="[font-family:var(--font-mono)] text-3xl text-[#D4A24C]">
              {count}
            </p>
            <p className="text-xs text-[#7C879C]">waiting</p>
          </div>
        </div>

        {count === 0 ? (
          <p className="text-[#7C879C] [font-family:var(--font-mono)] text-sm">
            — queue is empty —
          </p>
        ) : (
          <div className="space-y-4">
            {payments!.map((p) => (
              <AdminPaymentRow key={p.id} payment={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
