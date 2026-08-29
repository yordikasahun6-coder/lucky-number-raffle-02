import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const updates: Record<string, any> = {};

    const name = formData.get("name") as string | null;
    const account_holder = formData.get("account_holder") as string | null;
    const account_number = formData.get("account_number") as string | null;
    const active = formData.get("active") as string | null;
    const logo = formData.get("logo") as File | null;
    const qrCode = formData.get("qr_code") as File | null;

    if (name) updates.name = name;
    if (account_holder) updates.account_holder = account_holder;
    if (account_number) updates.account_number = account_number;
    if (active !== null) updates.active = active === "true";

    if (logo && logo.size > 0) {
      const fileExt = logo.name.split(".").pop();
      const fileName = `${Date.now()}-${(name || "logo").replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from("payment-logos")
        .upload(fileName, logo, { contentType: logo.type });
      if (!error && uploadData) {
        const { data: publicUrl } = supabaseAdmin.storage
          .from("payment-logos")
          .getPublicUrl(uploadData.path);
        updates.logo_url = publicUrl.publicUrl;
      }
    }

    if (qrCode && qrCode.size > 0) {
      const fileExt = qrCode.name.split(".").pop();
      const fileName = `qr-${Date.now()}-${(name || "qr").replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from("payment-logos")
        .upload(fileName, qrCode, { contentType: qrCode.type });
      if (!error && uploadData) {
        const { data: publicUrl } = supabaseAdmin.storage
          .from("payment-logos")
          .getPublicUrl(uploadData.path);
        updates.qr_code_url = publicUrl.publicUrl;
      }
    }

    const { error } = await supabaseAdmin
      .from("payment_accounts")
      .update(updates)
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin
    .from("payment_accounts")
    .update(body)
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("payment_accounts")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
