import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required." },
      { status: 400 },
    );
  }

  const { data: approved } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("phone_number", phone.trim())
    .eq("status", "approved")
    .limit(1);

  const isApproved = !!approved && approved.length > 0;

  const { data: numbers } = await supabaseAdmin
    .from("numbers")
    .select("number")
    .order("number", { ascending: true });

  const { data: myNumbers } = await supabaseAdmin
    .from("numbers")
    .select("number")
    .eq("phone_number", phone.trim());

  return NextResponse.json({
    approved: isApproved,
    allNumbers: numbers || [],
    myNumbers: (myNumbers || []).map((n) => n.number),
  });
}
