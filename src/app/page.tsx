import { supabaseAdmin } from "@/lib/supabase/admin";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [
    { data: assets },
    { data: rawAccounts },
    { data: settingsRows },
    { data: prizes },
    { data: supportMembers },
    { data: availabilityRows },
  ] = await Promise.all([
    supabaseAdmin.from("site_assets").select("*"),
    supabaseAdmin
      .from("payment_accounts")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabaseAdmin.from("app_settings").select("*").limit(1),
    supabaseAdmin
      .from("prizes")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabaseAdmin
      .from("support_team_members")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabaseAdmin.from("admin_availability").select("*"),
  ]);

  const availMap: Record<string, boolean> = {};
  for (const row of availabilityRows || [])
    availMap[row.admin_name] = row.is_available;

  const accounts = (rawAccounts || [])
    .filter(
      (a) =>
        !a.assigned_admin_name || availMap[a.assigned_admin_name] !== false,
    )
    .map((a) => ({
      ...a,
      isOnline: a.assigned_admin_name
        ? availMap[a.assigned_admin_name] !== false
        : null,
    }));

  const assetMap: Record<string, string | null> = {};
  (assets || []).forEach((a) => {
    assetMap[a.key] = a.image_url;
  });

  const settings = settingsRows?.[0] || {
    ticket_price: 100,
    currency: "ETB",
    closes_at: null,
    prize_disclaimer: null,
    telegram_username: null,
    max_number: 1000,
  };

  return (
    <HomePage
      assets={assetMap}
      accounts={accounts || []}
      settings={settings}
      prizes={prizes || []}
      botUsername={process.env.TELEGRAM_BOT_USERNAME || null}
      supportUsername={process.env.TELEGRAM_SUPPORT_USERNAME || null}
      supportMembers={supportMembers || []}
    />
  );
}
