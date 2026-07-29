import { supabaseAdmin } from "@/lib/supabase/admin";
import PickNumberClient from "@/components/PickNumberClient";

export const dynamic = "force-dynamic";

export default async function PickNumberPage() {
  const { data: assets } = await supabaseAdmin.from("site_assets").select("*");

  const assetMap: Record<string, string | null> = {};
  (assets || []).forEach((a) => {
    assetMap[a.key] = a.image_url;
  });

  return <PickNumberClient assets={assetMap} />;
}
