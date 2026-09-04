import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("ticket_price, currency")
    .limit(1)
    .single();
  const { data: prizes } = await supabaseAdmin
    .from("prizes")
    .select("amount")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .limit(1);

  const price = settings?.ticket_price || 0;
  const currency = settings?.currency || "ETB";
  const topPrize = prizes?.[0]?.amount || null;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FBF8EF 0%, #FFF3D6 100%)",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 90, marginBottom: 10 }}>🎫</div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#0F5132" }}>Lucky&nbsp;</span>
        <span style={{ color: "#E0A72E" }}>Ticket</span>
      </div>
      <div style={{ fontSize: 34, color: "#4A5A50", marginBottom: 40 }}>
        Your Next Win Could Be Yours
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 20,
            padding: "24px 40px",
            border: "2px solid #EAE1C4",
          }}
        >
          <div style={{ fontSize: 20, color: "#8A9A8F" }}>Ticket Price</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#0F5132" }}>
            {price} {currency}
          </div>
        </div>
        {topPrize && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "white",
              borderRadius: 20,
              padding: "24px 40px",
              border: "2px solid #EAE1C4",
            }}
          >
            <div style={{ fontSize: 20, color: "#8A9A8F" }}>Grand Prize</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#E0A72E" }}>
              {topPrize}
            </div>
          </div>
        )}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
