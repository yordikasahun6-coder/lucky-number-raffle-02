import { supabaseAdmin } from "@/lib/supabase/admin";
import AccountManager from "@/components/AccountManager";

export const dynamic = "force-dynamic";

export default async function AccountsAdminPage() {
  const { data: accounts } = await supabaseAdmin
    .from("payment_accounts")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <main className="min-h-screen bg-[#0B0F17] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
          Settings
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3] mb-8">
          Payment methods
        </h1>
        <AccountManager initialAccounts={accounts || []} />
      </div>
    </main>
  );
}
