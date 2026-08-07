import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select("*")
    .order("display_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prizes: data });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as File | null;

  if (!title || !amount) {
    return NextResponse.json(
      { error: "Title and amount are required." },
      { status: 400 },
    );
  }

  let image_url: string | null = null;

  if (image && image.size > 0) {
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${title.replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("prize-images")
      .upload(fileName, image, { contentType: image.type });

    if (uploadError) {
      return NextResponse.json(
        { error: `Image upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("prize-images")
      .getPublicUrl(uploadData.path);
    image_url = publicUrl.publicUrl;
  }

  const { data: existing } = await supabaseAdmin
    .from("prizes")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from("prizes")
    .insert({
      title,
      amount,
      description: description || null,
      image_url,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prize: data });
}
