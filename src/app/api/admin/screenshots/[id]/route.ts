import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("screenshot_url")
    .eq("id", id)
    .single();

  if (!payment || !payment.screenshot_url) {
    return NextResponse.json(
      { error: "No screenshot found for this payment." },
      { status: 404 },
    );
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from("payment-screenshots")
    .remove([payment.screenshot_url]);

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { error } = await supabaseAdmin
    .from("payments")
    .update({ screenshot_url: null })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
