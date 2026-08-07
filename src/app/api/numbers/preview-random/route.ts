import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc(
    "preview_random_available_number",
  );

  if (error) {
    return NextResponse.json(
      { error: "Could not find a number." },
      { status: 500 },
    );
  }

  if (data === null) {
    return NextResponse.json(
      { error: "No numbers available." },
      { status: 409 },
    );
  }

  return NextResponse.json({ number: data });
}
