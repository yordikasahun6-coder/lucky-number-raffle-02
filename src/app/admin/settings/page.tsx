import { supabaseAdmin } from "@/lib/supabase/admin";
import SettingsManager from "@/components/SettingsManager";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <main className="min-h-screen bg-[#0B0F17] px-4 py-10">
      <div className="max-w-md mx-auto">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
          Settings
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3] mb-8">
          Ticket price
        </h1>
        <SettingsManager initialSettings={settings} />
      </div>
    </main>
  );
}
