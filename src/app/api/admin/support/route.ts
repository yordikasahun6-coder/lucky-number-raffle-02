import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("support_team_members")
    .select("*")
    .order("display_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const response_time =
    (formData.get("response_time") as string) || "a few hours";
  const telegram_url = (formData.get("telegram_url") as string) || null;
  const instagram_url = (formData.get("instagram_url") as string) || null;
  const whatsapp_url = (formData.get("whatsapp_url") as string) || null;
  const email = (formData.get("email") as string) || null;
  const avatar = formData.get("avatar") as File | null;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  let avatar_url: string | null = null;

  if (avatar && avatar.size > 0) {
    const fileExt = avatar.name.split(".").pop();
    const fileName = `team-${Date.now()}-${name.replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("payment-logos")
      .upload(fileName, avatar, { contentType: avatar.type });
    if (uploadError)
      return NextResponse.json(
        { error: `Avatar upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    const { data: publicUrl } = supabaseAdmin.storage
      .from("payment-logos")
      .getPublicUrl(uploadData.path);
    avatar_url = publicUrl.publicUrl;
  }

  const { data: existing } = await supabaseAdmin
    .from("support_team_members")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from("support_team_members")
    .insert({
      name,
      description: description || null,
      avatar_url,
      response_time,
      telegram_url,
      instagram_url,
      whatsapp_url,
      email,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}
