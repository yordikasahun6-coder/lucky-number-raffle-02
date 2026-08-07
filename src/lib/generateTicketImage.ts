function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 2)}${"*".repeat(Math.max(phone.length - 4, 4))}${phone.slice(-2)}`;
}

export function generateTicketImage(params: {
  ticketNumber: number;
  customerName: string;
  phone: string;
  drawDateText: string;
}): string {
  const canvas = document.createElement("canvas");
  const width = 700;
  const height = 380;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0F5132");
  bgGradient.addColorStop(1, "#0C4028");
  ctx.fillStyle = bgGradient;
  roundRect(ctx, 0, 0, width, height, 24);
  ctx.fill();

  // Punch-hole notches (left and right)
  ctx.fillStyle = "#FBF8EF";
  ctx.beginPath();
  ctx.arc(0, height / 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width, height / 2, 16, 0, Math.PI * 2);
  ctx.fill();

  // Header
  ctx.fillStyle = "#E0A72E";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText("LUCKY TICKET", width / 2, 50);

  // Dashed perforation line
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(50, 72);
  ctx.lineTo(width - 50, 72);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ticket number label + value
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "13px sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("TICKET NUMBER", width / 2, 110);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 72px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(`#${params.ticketNumber}`, width / 2, 190);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 220);
  ctx.lineTo(width - 50, 220);
  ctx.stroke();

  // Bottom info row: name / phone / draw date / status
  const cols = [
    { label: "NAME", value: params.customerName, x: 90 },
    { label: "PHONE", value: maskPhone(params.phone), x: 280 },
    { label: "DRAW DATE", value: params.drawDateText, x: 470 },
  ];

  ctx.textAlign = "left";
  cols.forEach((c) => {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px sans-serif";
    ctx.fillText(c.label, c.x, 250);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(
      c.value.length > 16 ? c.value.slice(0, 15) + "…" : c.value,
      c.x,
      268,
    );
  });

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "10px sans-serif";
  ctx.fillText("STATUS", 90, 300);
  ctx.fillStyle = "#4FBF8B";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("✓ Confirmed", 90, 318);

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "10px monospace";
  ctx.fillText(
    `Issued ${new Date().toLocaleDateString()} · luckyticket.app`,
    width / 2,
    355,
  );

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
