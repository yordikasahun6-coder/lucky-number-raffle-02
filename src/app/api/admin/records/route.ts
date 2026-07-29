import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("phone")?.trim() || "";

  const { data: numbers, error } = await supabaseAdmin
    .from("numbers")
    .select(
      "number, phone_number, assigned_at, payment_id, payments(reference_number, customer_name, method)",
    )
    .eq("status", "taken")
    .order("assigned_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by phone number so each person shows once with all their tickets
  const grouped: Record<
    string,
    {
      phone_number: string;
      customer_name: string;
      entries: {
        number: number;
        reference_number: string | null;
        method: string | null;
        assigned_at: string;
      }[];
    }
  > = {};

  for (const row of numbers || []) {
    const payment = Array.isArray(row.payments)
      ? row.payments[0]
      : row.payments;
    const phone = row.phone_number as string;
    if (!grouped[phone]) {
      grouped[phone] = {
        phone_number: phone,
        customer_name: payment?.customer_name || "—",
        entries: [],
      };
    }
    grouped[phone].entries.push({
      number: row.number,
      reference_number: payment?.reference_number || null,
      method: payment?.method || null,
      assigned_at: row.assigned_at,
    });
  }

  let results = Object.values(grouped);

  if (search) {
    results = results.filter((r) => r.phone_number.includes(search));
  }

  return NextResponse.json({
    records: results,
    totalTickets: numbers?.length || 0,
  });
}
