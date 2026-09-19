import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("admin_availability")
    .select("is_available")
    .eq("admin_name", session.name)
    .single();

  return NextResponse.json({
    adminName: session.name,
    isAvailable: data?.is_available ?? true,
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { available } = await request.json();

  if (available === false) {
    // Safety check: never allow going offline if it would leave ZERO
    // payment methods visible to customers.
    const { data: accounts } = await supabaseAdmin
      .from("payment_accounts")
      .select("assigned_admin_name")
      .eq("active", true);

    const { data: availabilityRows } = await supabaseAdmin
      .from("admin_availability")
      .select("*");
    const availMap: Record<string, boolean> = {};
    for (const row of availabilityRows || [])
      availMap[row.admin_name] = row.is_available;

    // Simulate this admin going offline
    availMap[session.name] = false;

    const wouldBeVisible = (accounts || []).some(
      (a) =>
        !a.assigned_admin_name || availMap[a.assigned_admin_name] !== false,
    );

    if (!wouldBeVisible) {
      return NextResponse.json(
        {
          error:
            "You're the only one available right now — customers need at least one payment method visible. Ask another admin to go online first.",
        },
        { status: 409 },
      );
    }
  }

  await supabaseAdmin
    .from("admin_availability")
    .upsert({
      admin_name: session.name,
      is_available: available,
      updated_at: new Date().toISOString(),
    });

  return NextResponse.json({ success: true, isAvailable: available });
}
