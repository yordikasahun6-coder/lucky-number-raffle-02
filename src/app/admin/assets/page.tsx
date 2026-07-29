import { supabaseAdmin } from "@/lib/supabase/admin";
import AssetManager from "@/components/AssetManager";

export const dynamic = "force-dynamic";

export default async function AssetsAdminPage() {
  const { data: assets } = await supabaseAdmin
    .from("site_assets")
    .select("*")
    .order("key", { ascending: true });

  return (
    <main className="min-h-screen bg-[#0B0F17] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
          Settings
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3] mb-8">
          Site images
        </h1>
        <AssetManager initialAssets={assets || []} />
      </div>
    </main>
  );
}
