import { supabaseAdmin } from "@/lib/supabase/admin";
import PrizeManager from "@/components/PrizeManager";

export const dynamic = "force-dynamic";

export default async function PrizesAdminPage() {
  const { data: prizes } = await supabaseAdmin
    .from("prizes")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <main className="px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
          Settings
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3] mb-8">
          Prizes
        </h1>
        <PrizeManager initialPrizes={prizes || []} />
      </div>
    </main>
  );
}
