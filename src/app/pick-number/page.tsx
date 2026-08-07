import { supabaseAdmin } from "@/lib/supabase/admin";
import PickNumberClient from "@/components/PickNumberClient";

export const dynamic = "force-dynamic";

export default async function PickNumberPage() {
  const [{ data: assets }, { data: settingsRows }] = await Promise.all([
    supabaseAdmin.from("site_assets").select("*"),
    supabaseAdmin.from("app_settings").select("closes_at, max_number").limit(1),
  ]);

  const assetMap: Record<string, string | null> = {};
  (assets || []).forEach((a) => {
    assetMap[a.key] = a.image_url;
  });

  const closesAt = settingsRows?.[0]?.closes_at || null;
  const maxNumber = settingsRows?.[0]?.max_number || 1000;

  return (
    <PickNumberClient
      assets={assetMap}
      closesAt={closesAt}
      maxNumber={maxNumber}
    />
  );
}
