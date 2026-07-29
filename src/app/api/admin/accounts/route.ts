import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("payment_accounts")
    .select("*")
    .order("display_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts: data });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const account_holder = formData.get("account_holder") as string;
  const account_number = formData.get("account_number") as string;
  const logo = formData.get("logo") as File | null;

  if (!name || !account_holder || !account_number) {
    return NextResponse.json(
      { error: "Name, account holder, and account number are required." },
      { status: 400 },
    );
  }

  let logo_url: string | null = null;

  if (logo && logo.size > 0) {
    const fileExt = logo.name.split(".").pop();
    const fileName = `${Date.now()}-${name.replace(/[^a-z0-9]/gi, "-")}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("payment-logos")
      .upload(fileName, logo, { contentType: logo.type });

    if (uploadError) {
      return NextResponse.json(
        { error: `Logo upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("payment-logos")
      .getPublicUrl(uploadData.path);
    logo_url = publicUrl.publicUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("payment_accounts")
    .insert({ name, account_holder, account_number, logo_url })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account: data });
}
