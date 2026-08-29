"use client";

import { useState } from "react";

export default function ResetClient() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmation }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Reset failed.");
      setBusy(false);
      return;
    }

    setDone(result.screenshotsDeleted);
    setBusy(false);
  }

  if (done !== null) {
    return (
      <main className="px-6 py-8 md:px-10 md:py-10 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full text-center rounded-2xl bg-[#131C2B] border border-[#22C55E]/40 p-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#123522] flex items-center justify-center text-2xl text-[#22C55E]">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mb-2">
            Reset complete
          </h1>
          <p className="text-[#9AA7BC] text-sm leading-relaxed">
            All numbers are available again, every payment record and {done}{" "}
            screenshot{done !== 1 ? "s" : ""} were cleared. Payment methods,
            images, and price settings were kept.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#EF476F] uppercase mb-1">
          Danger Zone
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          Reset everything
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Start a fresh raffle round from zero.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#EF476F] mt-3" />
      </div>

      <div className="max-w-xl">
        <div className="rounded-2xl bg-[#351722] border border-[#EF476F]/40 p-5 mb-6 flex items-start gap-4">
          <span className="w-10 h-10 rounded-xl bg-[#EF476F]/20 flex items-center justify-center text-[#EF476F] text-lg shrink-0">
            ⚠️
          </span>
          <div>
            <p className="text-[#F5F7FA] text-sm font-semibold mb-1">
              This cannot be undone
            </p>
            <p className="text-[#F5B8C6] text-xs leading-relaxed">
              Every payment, every claimed number, and every screenshot will be
              permanently deleted. Payment methods, site images, and ticket
              price will be kept.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleReset}
          className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6 space-y-5"
        >
          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Admin password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm focus:outline-none focus:border-[#EF476F]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Type{" "}
              <span className="[font-family:var(--font-mono)] text-[#EF476F] font-bold">
                RESET EVERYTHING
              </span>{" "}
              to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#EF476F]"
            />
          </div>

          {error && <p className="text-[#EF476F] text-xs">{error}</p>}

          <button
            type="submit"
            disabled={busy || confirmation !== "RESET EVERYTHING"}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EF476F] to-[#c93a5c] text-white font-semibold py-3.5 disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            {busy ? "Resetting..." : "🗑 Reset Everything"}
          </button>
        </form>
      </div>
    </main>
  );
}
