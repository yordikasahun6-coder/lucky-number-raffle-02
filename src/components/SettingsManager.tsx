"use client";

import { useState } from "react";

type Settings = {
  ticket_price: number;
  currency: string;
  closes_at: string | null;
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

  return (
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
        <label className="block text-sm text-[#7C879C] mb-1.5">Currency</label>
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
          Draw / closing date <span className="text-[#4A5468]">(optional)</span>
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
  );
}
