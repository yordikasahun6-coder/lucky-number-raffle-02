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
  }

  return (
    <div className="space-y-4">
      <div className="rounded bg-[#141B29] border border-[#232D42] p-5 space-y-3">
        <label className="block text-sm text-[#7C879C] mb-1.5">
          Total number of tickets{" "}
          <span className="text-[#4A5468]">(current: {currentMax})</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={maxNumber}
            onChange={(e) => setMaxNumber(Number(e.target.value))}
            className="flex-1 rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] [font-family:var(--font-mono)]"
          />
          <button
            type="button"
            onClick={handleResize}
            disabled={resizing || maxNumber === currentMax}
            className="rounded bg-[#D4A24C] text-[#0B0F17] font-medium px-4 py-2 disabled:opacity-50"
          >
            {resizing ? "Applying..." : "Apply"}
          </button>
        </div>
        <p className="text-xs text-[#4A5468]">
          Change how many numbers customers can pick from (e.g. 500 for a
          smaller raffle, 1000 for the default). Growing is always safe.
          Shrinking below a number a customer already claimed is blocked
          automatically.
        </p>
        {resizeError && <p className="text-[#E15B4F] text-xs">{resizeError}</p>}
        {resizeSaved && (
          <p className="text-[#4FBF8B] text-xs">
            Ticket pool updated to {currentMax}.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded bg-[#141B29] border border-[#232D42] p-5 space-y-4"
      >
        <div>
          <label className="block text-sm text-[#7C879C] mb-1.5">
            Price per ticket
          </label>
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] [font-family:var(--font-mono)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#7C879C] mb-1.5">
            Currency
          </label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="ETB"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] [font-family:var(--font-mono)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#7C879C] mb-1.5">
            Draw / closing date{" "}
            <span className="text-[#4A5468]">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] [font-family:var(--font-mono)]"
          />
          <p className="text-xs text-[#4A5468] mt-1.5">
            Shows a live countdown on the homepage. Once this time passes, new
            submissions and number claims stop automatically.
          </p>
          {closesAt && (
            <button
              type="button"
              onClick={() => setClosesAt("")}
              className="text-xs text-[#E15B4F] mt-2"
            >
              Remove deadline
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm text-[#7C879C] mb-1.5">
            Telegram username <span className="text-[#4A5468]">(optional)</span>
          </label>
          <input
            type="text"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="e.g. luckyticket_admin (without the @)"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] [font-family:var(--font-mono)]"
          />
          <p className="text-xs text-[#4A5468] mt-1.5">
            Turns "send it on Telegram" into a real tappable button on the
            homepage.
          </p>
        </div>

        <div>
          <label className="block text-sm text-[#7C879C] mb-1.5">
            Prize terms notice{" "}
            <span className="text-[#4A5468]">(optional)</span>
          </label>
          <textarea
            value={disclaimer}
            onChange={(e) => setDisclaimer(e.target.value)}
            rows={4}
            placeholder="e.g. Prizes are paid in full only if 100% of tickets are sold. If fewer sell, prize amounts will be reduced proportionally."
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <p className="text-xs text-[#4A5468] mt-1.5">
            Shown as a clear notice on the homepage right under the prizes.
            Leave empty to hide it.
          </p>
        </div>

        {error && <p className="text-[#E15B4F] text-xs">{error}</p>}
        {saved && <p className="text-[#4FBF8B] text-xs">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-[#D4A24C] text-[#0B0F17] font-medium py-2.5 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
