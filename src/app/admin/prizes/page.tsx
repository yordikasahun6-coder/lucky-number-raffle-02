import { supabaseAdmin } from "@/lib/supabase/admin";
import PrizeManager from "@/components/PrizeManager";

export const dynamic = "force-dynamic";

export default async function PrizesAdminPage() {
  const { data: prizes } = await supabaseAdmin
    .from("prizes")
    .select("*")
    .order("display_order", { ascending: true });

  return <PrizeManager initialPrizes={prizes || []} />;
}
