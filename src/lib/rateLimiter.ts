import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_ATTEMPTS_PER_WINDOW = 5;
const WINDOW_MINUTES = 10;

export async function checkRateLimit(
  identifier: string,
): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const { count } = await supabaseAdmin
    .from("submission_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .gte("created_at", windowStart.toISOString());

  if ((count || 0) >= MAX_ATTEMPTS_PER_WINDOW) {
    return { allowed: false, retryAfterMinutes: WINDOW_MINUTES };
  }

  await supabaseAdmin.from("submission_attempts").insert({ identifier });

  // Occasionally clean up old rows so the table doesn't grow forever —
  // cheap to run inline rather than needing a separate cron job for this
  if (Math.random() < 0.1) {
    await supabaseAdmin.rpc("cleanup_old_submission_attempts");
  }

  return { allowed: true };
}
