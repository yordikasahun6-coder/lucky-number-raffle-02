import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SESSION_DAYS = 30;

function generateToken(): string {
  return Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
}

export async function createSession(
  adminName: string,
  adminUsername: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await supabaseAdmin.from("admin_sessions").insert({
    token,
    admin_name: adminName,
    admin_username: adminUsername,
    expires_at: expiresAt.toISOString(),
  });

  return token;
}

export async function validateSession(
  token: string | undefined,
): Promise<{ name: string; username: string } | null> {
  if (!token) return null;

  const { data } = await supabaseAdmin
    .from("admin_sessions")
    .select("admin_name, admin_username, expires_at")
    .eq("token", token)
    .single();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return { name: data.admin_name, username: data.admin_username };
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  await supabaseAdmin.from("admin_sessions").delete().eq("token", token);
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<{ name: string } | null> {
  // The permanent Owner login — always works via the env var password,
  // regardless of what's in admin_users, so you can never be locked out.
  if (
    (username.toLowerCase() === "owner" || username.trim() === "") &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return { name: "Owner" };
  }

  const { data: user } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("active", true)
    .single();

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { name: user.display_name };
}
