import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, username, display_name, active, created_at")
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data });
}

export async function POST(request: NextRequest) {
  const { username, password, display_name } = await request.json();

  if (!username || !password || !display_name) {
    return NextResponse.json(
      { error: "Username, password, and display name are required." },
      { status: 400 },
    );
  }

  if (username.toLowerCase() === "owner") {
    return NextResponse.json(
      { error: '"owner" is reserved for the master login.' },
      { status: 400 },
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .insert({ username: username.toLowerCase(), password_hash, display_name })
    .select("id, username, display_name, active, created_at")
    .single();

  if (error) {
    if (error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ admin: data });
}
