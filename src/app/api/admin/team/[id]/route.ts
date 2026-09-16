import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSession } from "@/lib/adminAuth";

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);
  return session?.name === "Owner";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireOwner(request))) {
    return NextResponse.json(
      { error: "Only the Owner can manage team access." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabaseAdmin
    .from("admin_users")
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
  if (!(await requireOwner(request))) {
    return NextResponse.json(
      { error: "Only the Owner can manage team access." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("admin_users")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
