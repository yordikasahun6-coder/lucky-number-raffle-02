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
    const description = formData.get("description") as string | null;
    const response_time = formData.get("response_time") as string | null;
    const telegram_url = formData.get("telegram_url") as string | null;
    const instagram_url = formData.get("instagram_url") as string | null;
    const whatsapp_url = formData.get("whatsapp_url") as string | null;
    const email = formData.get("email") as string | null;
    const active = formData.get("active") as string | null;
    const avatar = formData.get("avatar") as File | null;

    if (name) updates.name = name;
    if (description !== null) updates.description = description || null;
    if (response_time) updates.response_time = response_time;
    if (telegram_url !== null) updates.telegram_url = telegram_url || null;
    if (instagram_url !== null) updates.instagram_url = instagram_url || null;
    if (whatsapp_url !== null) updates.whatsapp_url = whatsapp_url || null;
    if (email !== null) updates.email = email || null;
    if (active !== null) updates.active = active === "true";

    if (avatar && avatar.size > 0) {
      const fileExt = avatar.name.split(".").pop();
      const fileName = `team-${Date.now()}-${(name || "avatar").replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from("payment-logos")
        .upload(fileName, avatar, { contentType: avatar.type });
      if (!error && uploadData) {
        const { data: publicUrl } = supabaseAdmin.storage
          .from("payment-logos")
          .getPublicUrl(uploadData.path);
        updates.avatar_url = publicUrl.publicUrl;
      }
    }

    const { error } = await supabaseAdmin
      .from("support_team_members")
      .update(updates)
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin
    .from("support_team_members")
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
    .from("support_team_members")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
