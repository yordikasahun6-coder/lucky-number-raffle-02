import { supabaseAdmin } from "@/lib/supabase/admin";
import SupportManager from "@/components/SupportManager";

export const dynamic = "force-dynamic";

export default async function SupportAdminPage() {
  const { data: members } = await supabaseAdmin
    .from("support_team_members")
    .select("*")
    .order("display_order", { ascending: true });

  return <SupportManager initialMembers={members || []} />;
}
