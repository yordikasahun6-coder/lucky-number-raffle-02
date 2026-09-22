import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSession } from "@/lib/adminAuth";

function generateCode() {
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  )
    .join("")
    .toUpperCase();
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("telegram_admin_links")
    .select("*")
    .eq("admin_name", session.name)
    .single();

  return NextResponse.json({
    adminName: session.name,
    linked: !!data?.chat_id,
    linkCode: data?.link_code || null,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const code = generateCode();

  await supabaseAdmin.from("telegram_admin_links").upsert({
    admin_name: session.name,
    link_code: code,
    chat_id: null,
    linked_at: null,
  });

  return NextResponse.json({
    linkCode: code,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
  });
}
