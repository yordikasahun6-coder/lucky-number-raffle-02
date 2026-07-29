import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from("numbers")
    .select("number")
    .eq("status", "available")
    .order("number", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { error: "No numbers available." },
      { status: 409 },
    );
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  return NextResponse.json({ number: data[randomIndex].number });
}
