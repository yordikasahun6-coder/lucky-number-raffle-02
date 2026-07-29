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
      <main className="px-4 py-10">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="[font-family:var(--font-fraunces)] text-2xl text-[#EDEFF3] mb-2">
            Reset complete
          </h1>
          <p className="text-[#7C879C] text-sm">
            All numbers are available again, every payment record and {done}{" "}
            screenshot{done !== 1 ? "s" : ""} were cleared. Payment methods,
            images, and price settings were kept.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="rounded border border-[#E15B4F] bg-[#E15B4F]/5 p-4 mb-6">
          <p className="text-[#E15B4F] text-sm font-medium mb-1">
            ⚠ This cannot be undone
          </p>
          <p className="text-[#7C879C] text-xs">
            Every payment, every claimed number, and every screenshot will be
            permanently deleted. Payment methods, site images, and ticket price
            will be kept.
          </p>
        </div>

        <form
          onSubmit={handleReset}
          className="rounded bg-[#141B29] border border-[#232D42] p-5 space-y-4"
        >
          <div>
            <label className="block text-sm text-[#7C879C] mb-1.5">
              Admin password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#7C879C] mb-1.5">
              Type{" "}
              <span className="[font-family:var(--font-mono)] text-[#E15B4F]">
                RESET EVERYTHING
              </span>{" "}
              to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 [font-family:var(--font-mono)] text-[#EDEFF3]"
            />
          </div>

          {error && <p className="text-[#E15B4F] text-xs">{error}</p>}

          <button
            type="submit"
            disabled={busy || confirmation !== "RESET EVERYTHING"}
            className="w-full rounded bg-[#E15B4F] text-white font-medium py-2.5 disabled:opacity-30"
          >
            {busy ? "Resetting..." : "Reset everything"}
          </button>
        </form>
      </div>
    </main>
  );
}
