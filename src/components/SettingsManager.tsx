"use client";

import { useState } from "react";

type Settings = {
  ticket_price: number;
  currency: string;
  closes_at: string | null;
  prize_disclaimer: string | null;
  telegram_username: string | null;
  max_number: number;
};

export default function SettingsManager({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [price, setPrice] = useState(initialSettings?.ticket_price ?? 100);
  const [currency, setCurrency] = useState(initialSettings?.currency ?? "ETB");
  const [closesAt, setClosesAt] = useState(
    initialSettings?.closes_at ? initialSettings.closes_at.slice(0, 16) : "",
  );
  const [disclaimer, setDisclaimer] = useState(
    initialSettings?.prize_disclaimer ?? "",
  );
  const [telegramUsername, setTelegramUsername] = useState(
    initialSettings?.telegram_username ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [maxNumber, setMaxNumber] = useState(
    initialSettings?.max_number ?? 1000,
  );
  const [currentMax, setCurrentMax] = useState(
    initialSettings?.max_number ?? 1000,
  );
  const [resizing, setResizing] = useState(false);
  const [resizeError, setResizeError] = useState("");
  const [resizeSaved, setResizeSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket_price: Number(price),
        currency,
        closes_at: closesAt ? new Date(closesAt).toISOString() : null,
        prize_disclaimer: disclaimer.trim() || null,
        telegram_username: telegramUsername.trim().replace(/^@/, "") || null,
      }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Could not save.");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleResize() {
    setResizing(true);
    setResizeError("");
    setResizeSaved(false);

    const res = await fetch("/api/admin/resize-pool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ max_number: maxNumber }),
    });
    const result = await res.json();

    if (!res.ok) {
      setResizeError(result.error || "Could not resize.");
      setResizing(false);
      return;
    }

    setCurrentMax(result.max_number);
    setResizeSaved(true);
    setResizing(false);
    setTimeout(() => setResizeSaved(false), 3000);
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Configuration
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">Settings</h1>
        <p className="text-[#9AA7BC] text-sm">
          Control how your raffle runs, top to bottom.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Ticket pool card */}
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-[#29164F] flex items-center justify-center text-[#8B4DFF]">
              🎟️
            </span>
            <div>
              <p className="text-[#F5F7FA] font-semibold">Ticket pool size</p>
              <p className="text-[#64748B] text-xs">
                Current: {currentMax} numbers
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              min="1"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              className="flex-1 rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#6D35D8]"
            />
            <button
              type="button"
              onClick={handleResize}
              disabled={resizing || maxNumber === currentMax}
              className="rounded-xl bg-gradient-to-r from-[#6D35D8] to-[#8B4DFF] text-white text-sm font-semibold px-5 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {resizing ? "..." : "Apply"}
            </button>
          </div>
          <p className="text-[#64748B] text-xs leading-relaxed">
            Growing is always safe. Shrinking below a claimed number is blocked
            automatically.
          </p>
          {resizeError && (
            <p className="text-[#EF476F] text-xs mt-2">{resizeError}</p>
          )}
          {resizeSaved && (
            <p className="text-[#22C55E] text-xs mt-2">
              ✓ Ticket pool updated to {currentMax}.
            </p>
          )}
        </div>

        {/* Price + currency card */}
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-[#3A2E10] flex items-center justify-center text-[#D9A63A]">
              💰
            </span>
            <div>
              <p className="text-[#F5F7FA] font-semibold">Ticket price</p>
              <p className="text-[#64748B] text-xs">What each ticket costs</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9AA7BC] text-xs mb-1.5">
                Price
              </label>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#D9A63A]"
              />
            </div>
            <div>
              <label className="block text-[#9AA7BC] text-xs mb-1.5">
                Currency
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="ETB"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#D9A63A]"
              />
            </div>
          </div>
        </div>

        {/* Draw date card */}
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-[#123522] flex items-center justify-center text-[#22C55E]">
              📅
            </span>
            <div>
              <p className="text-[#F5F7FA] font-semibold">
                Draw / closing date
              </p>
              <p className="text-[#64748B] text-xs">
                Optional countdown on the homepage
              </p>
            </div>
          </div>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#22C55E] mb-2"
          />
          <p className="text-[#64748B] text-xs leading-relaxed">
            Once this passes, submissions and claims stop automatically.
          </p>
          {closesAt && (
            <button
              type="button"
              onClick={() => setClosesAt("")}
              className="text-[#EF476F] text-xs mt-2 hover:text-[#F5F7FA] transition-colors"
            >
              ✕ Remove deadline
            </button>
          )}
        </div>

        {/* Telegram card */}
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-[#0d3a52] flex items-center justify-center text-[#229ED9]">
              ✈️
            </span>
            <div>
              <p className="text-[#F5F7FA] font-semibold">Telegram username</p>
              <p className="text-[#64748B] text-xs">
                Powers the "Send on Telegram" button
              </p>
            </div>
          </div>
          <input
            type="text"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="e.g. luckyticket_admin (no @)"
            className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#229ED9]"
          />
        </div>

        {/* Prize disclaimer — full width */}
        <div className="lg:col-span-2 rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-[#351722] flex items-center justify-center text-[#EF476F]">
              ⚠️
            </span>
            <div>
              <p className="text-[#F5F7FA] font-semibold">Prize terms notice</p>
              <p className="text-[#64748B] text-xs">
                Shown right under the prizes on the homepage
              </p>
            </div>
          </div>
          <textarea
            value={disclaimer}
            onChange={(e) => setDisclaimer(e.target.value)}
            rows={3}
            placeholder="e.g. Prizes are paid in full only if 100% of tickets are sold. If fewer sell, prize amounts will be reduced proportionally."
            className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#EF476F]"
          />
          <p className="text-[#64748B] text-xs mt-2">
            Leave empty to hide it entirely.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-7 py-3 disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving..." : "💾 Save Settings"}
        </button>
        {error && <p className="text-[#EF476F] text-sm">{error}</p>}
        {saved && (
          <p className="text-[#22C55E] text-sm">✓ Saved successfully</p>
        )}
      </div>
    </main>
  );
}
