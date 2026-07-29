import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  const download = request.nextUrl.searchParams.get("download");

  if (!path) {
    return NextResponse.json({ error: "Missing path." }, { status: 400 });
  }

  if (!download) {
    // Original behavior — just view it via a redirect to a signed URL
    const { data, error } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .createSignedUrl(path, 60);

    if (error || !data) {
      return NextResponse.json(
        { error: "Could not load screenshot." },
        { status: 404 },
      );
    }
    return NextResponse.redirect(data.signedUrl);
  }

  // Download mode — fetch the actual bytes and force a save-as with a
  // proper filename, instead of opening in a browser tab.
  const { data: fileBlob, error } = await supabaseAdmin.storage
    .from("payment-screenshots")
    .download(path);

  if (error || !fileBlob) {
    return NextResponse.json(
      { error: "Could not load screenshot." },
      { status: 404 },
    );
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());
  const filename = path.split("/").pop() || "screenshot.jpg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": fileBlob.type || "image/jpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
