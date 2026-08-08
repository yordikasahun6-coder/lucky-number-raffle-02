import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export async function GET() {
  let totalBytes = 0;
  let fileCount = 0;
  let offset = 0;
  const pageSize = 1000;

  // Supabase's list() paginates in batches of up to 1000 — loop until
  // we've counted every file, since a busy raffle could have more than
  // 1000 screenshots stored.
  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .list("", { limit: pageSize, offset });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;

    for (const file of data) {
      if (file.metadata?.size) totalBytes += file.metadata.size;
    }
    fileCount += data.length;

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return NextResponse.json({
    fileCount,
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
  });
}
