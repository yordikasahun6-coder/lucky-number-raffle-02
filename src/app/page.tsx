import { supabaseAdmin } from "@/lib/supabase/admin";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [{ data: assets }, { data: accounts }, { data: settingsRows }] =
    await Promise.all([
      supabaseAdmin.from("site_assets").select("*"),
      supabaseAdmin
        .from("payment_accounts")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true }),
      supabaseAdmin.from("app_settings").select("*").limit(1),
    ]);

  const assetMap: Record<string, string | null> = {};
  (assets || []).forEach((a) => {
    assetMap[a.key] = a.image_url;
  });

  const settings = settingsRows?.[0] || {
    ticket_price: 100,
    currency: "ETB",
    closes_at: null,
  };

  return (
    <HomePage assets={assetMap} accounts={accounts || []} settings={settings} />
  );
}
