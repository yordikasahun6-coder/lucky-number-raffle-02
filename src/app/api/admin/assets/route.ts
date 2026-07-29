import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_assets")
    .select("*")
    .order("key", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assets: data });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const key = formData.get("key") as string;
  const file = formData.get("file") as File | null;

  if (!key || !file) {
    return NextResponse.json(
      { error: "Missing key or file." },
      { status: 400 },
    );
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${key}-${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("site-assets")
    .upload(fileName, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from("site-assets")
    .getPublicUrl(uploadData.path);

  const { error } = await supabaseAdmin
    .from("site_assets")
    .update({
      image_url: publicUrl.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, image_url: publicUrl.publicUrl });
}
