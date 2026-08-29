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

    const title = formData.get("title") as string | null;
    const amount = formData.get("amount") as string | null;
    const description = formData.get("description") as string | null;
    const active = formData.get("active") as string | null;
    const image = formData.get("image") as File | null;

    if (title) updates.title = title;
    if (amount) updates.amount = amount;
    if (description !== null) updates.description = description || null;
    if (active !== null) updates.active = active === "true";

    if (image && image.size > 0) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${(title || "prize").replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from("prize-images")
        .upload(fileName, image, { contentType: image.type });
      if (!error && uploadData) {
        const { data: publicUrl } = supabaseAdmin.storage
          .from("prize-images")
          .getPublicUrl(uploadData.path);
        updates.image_url = publicUrl.publicUrl;
      }
    }

    const { error } = await supabaseAdmin
      .from("prizes")
      .update(updates)
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin
    .from("prizes")
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
  const { error } = await supabaseAdmin.from("prizes").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
