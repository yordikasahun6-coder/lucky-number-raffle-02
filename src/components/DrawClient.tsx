"use client";

import { useState, useEffect } from "react";

type Draw = {
  id: string;
  ticket_number: number;
  phone_number: string;
  customer_name: string;
  drawn_at: string;
  broadcasted: boolean;
};

export default function DrawClient() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0);
  const [totalPool, setTotalPool] = useState(1000);
  const [soldOut, setSoldOut] = useState(false);
  const [overrideEarly, setOverrideEarly] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollingNumber, setRollingNumber] = useState<number | null>(null);
  const [newDraw, setNewDraw] = useState<Draw | null>(null);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    id: string;
    sent: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/draw");
    const data = await res.json();
    setDraws(data.draws || []);
    setEligibleCount(data.eligibleCount || 0);
    setRemainingCount(data.remainingCount || 0);
    setTotalPool(data.totalPool || 1000);
    setSoldOut(data.soldOut || false);
  }

  async function handleDraw() {
    setError("");
    setNewDraw(null);
    setRolling(true);

    let ticks = 0;
    const interval = setInterval(() => {
      setRollingNumber(Math.floor(Math.random() * 1000) + 1);
      ticks++;
      if (ticks > 20) clearInterval(interval);
    }, 70);

    const res = await fetch("/api/admin/draw", { method: "POST" });
    const result = await res.json();

    setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
      if (!res.ok) {
        setError(result.error || "Draw failed.");
        return;
      }
      setRollingNumber(result.draw.ticket_number);
      setNewDraw(result.draw);
      load();
    }, 1600);
  }

  async function handleUndoAndRedraw() {
    if (!newDraw) return;
    if (
      !confirm(
        "Undo this draw and pick a fresh winner? This proves the result isn't fixed.",
      )
    )
      return;
    setUndoing(true);
    await fetch(`/api/admin/draw/${newDraw.id}`, { method: "DELETE" });
    setNewDraw(null);
    setRollingNumber(null);
    setBroadcastResult(null);
    await load();
    setUndoing(false);
    handleDraw();
  }

  async function handleUndoHistoryEntry(drawId: string) {
    if (
      !confirm(
        "Undo this draw entirely? It will be removed from history and that ticket becomes eligible again.",
      )
    )
      return;
    await fetch(`/api/admin/draw/${drawId}`, { method: "DELETE" });
    if (newDraw?.id === drawId) setNewDraw(null);
    load();
  }

  async function handleBroadcast(drawId: string) {
    setBroadcasting(drawId);
    setBroadcastResult(null);
    const res = await fetch("/api/admin/draw/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draw_id: drawId }),
    });
    const result = await res.json();
    if (res.ok) {
      setBroadcastResult({
        id: drawId,
        sent: result.sent,
        total: result.total,
      });
      load();
    }
    setBroadcasting(null);
  }

  const percentSold =
    totalPool > 0 ? Math.round((eligibleCount / totalPool) * 100) : 0;
  const canDraw = (soldOut || overrideEarly) && remainingCount > 0;

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#D9A63A] uppercase mb-1">
          Draw Day
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          Draw & Announce Winner
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Pick a genuinely random winning ticket and broadcast it to everyone
          who played.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#D9A63A] mt-3" />
      </div>

      {/* Sold-out progress gate */}
      <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6 mb-6 max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#F5F7FA] font-semibold text-sm">Tickets sold</p>
          <p className="[font-family:var(--font-mono)] text-sm text-[#D9A63A] font-bold">
            {percentSold}%
          </p>
        </div>
        <div className="relative h-3 rounded-full bg-[#080D16] overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] transition-all duration-700"
            style={{ width: `${percentSold}%` }}
          />
        </div>
        <p className="text-[#9AA7BC] text-xs">
          {eligibleCount} / {totalPool} tickets claimed
        </p>

        {!soldOut && (
          <div className="mt-4 rounded-xl bg-[#3A2E10]/40 border border-[#D9A63A]/30 p-4">
            <p className="text-[#F2C14E] text-xs font-semibold mb-1">
              ⏳ Not sold out yet
            </p>
            <p className="text-[#9AA7BC] text-xs leading-relaxed mb-3">
              The draw will unlock automatically once all {totalPool} tickets
              are claimed. If you need to run a practice draw before that (for
              testing only), you can override this below.
            </p>
            <label className="flex items-center gap-2 text-[#9AA7BC] text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={overrideEarly}
                onChange={(e) => setOverrideEarly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#D9A63A]"
              />
              I understand — allow drawing before sold out (testing only)
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 text-center">
          <p className="text-2xl font-bold text-[#22C55E]">{remainingCount}</p>
          <p className="text-[#9AA7BC] text-xs">Eligible tickets</p>
        </div>
        <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 text-center">
          <p className="text-2xl font-bold text-[#D9A63A]">{draws.length}</p>
          <p className="text-[#9AA7BC] text-xs">Draws so far</p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-[#24134A] to-[#131C2B] border-2 border-[#7C3AED]/40 p-8 mb-8 text-center max-w-lg">
        <div className="rounded-2xl bg-[#080D16] h-28 flex items-center justify-center mb-6">
          <span
            className={`[font-family:var(--font-mono)] text-5xl font-bold text-[#D9A63A] tabular-nums ${rolling ? "" : newDraw ? "draw-reveal" : ""}`}
          >
            {rollingNumber !== null ? `#${rollingNumber}` : "#———"}
          </span>
        </div>

        {newDraw && !rolling && (
          <div className="draw-reveal mb-5">
            <p className="text-[#F5F7FA] text-lg font-bold">
              {newDraw.customer_name}
            </p>
            <p className="[font-family:var(--font-mono)] text-sm text-[#9AA7BC]">
              {newDraw.phone_number}
            </p>
          </div>
        )}

        {error && <p className="text-[#EF476F] text-sm mb-4">{error}</p>}

        {!canDraw && !newDraw && (
          <p className="text-[#64748B] text-xs mb-3">
            {remainingCount === 0
              ? "No eligible tickets left."
              : "Draw unlocks once all tickets are sold."}
          </p>
        )}

        <button
          onClick={handleDraw}
          disabled={rolling || !canDraw}
          className="w-full rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] font-bold py-4 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {rolling ? "🎲 Drawing..." : "🎉 Draw a Winner"}
        </button>

        {newDraw && !rolling && (
          <>
            <button
              onClick={() => handleBroadcast(newDraw.id)}
              disabled={broadcasting === newDraw.id}
              className="w-full mt-3 rounded-xl bg-[#229ED9] text-white font-semibold py-3 disabled:opacity-50 hover:bg-[#1B8BC0] transition-colors"
            >
              {broadcasting === newDraw.id
                ? "Sending..."
                : "✈️ Announce to Telegram"}
            </button>

            <button
              onClick={handleUndoAndRedraw}
              disabled={undoing}
              className="w-full mt-3 rounded-xl border border-[#EF476F]/40 text-[#EF476F] text-sm font-semibold py-2.5 disabled:opacity-50 hover:bg-[#EF476F] hover:text-white transition-colors"
            >
              {undoing
                ? "Undoing..."
                : "🔄 Undo & Draw Again (prove it's fair)"}
            </button>
          </>
        )}
        {broadcastResult && broadcastResult.id === newDraw?.id && (
          <p className="text-[#22C55E] text-xs mt-2">
            ✓ Announced to {broadcastResult.sent} of {broadcastResult.total}{" "}
            customers
          </p>
        )}
      </div>

      <div className="max-w-2xl">
        <p className="text-[#F5F7FA] font-semibold mb-3">Draw history</p>
        {draws.length === 0 ? (
          <p className="text-[#64748B] text-sm">No draws yet.</p>
        ) : (
          <div className="space-y-2">
            {draws.map((d) => (
              <div
                key={d.id}
                className="rounded-xl bg-[#131C2B] border border-[#26344A] px-5 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="[font-family:var(--font-fraunces)] text-lg font-bold text-[#D9A63A]">
                    #{d.ticket_number}
                  </span>
                  <div>
                    <p className="text-[#F5F7FA] text-sm">{d.customer_name}</p>
                    <p className="[font-family:var(--font-mono)] text-xs text-[#64748B]">
                      {d.phone_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {d.broadcasted ? (
                    <span className="text-[#22C55E] text-xs font-semibold">
                      ✓ Announced
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBroadcast(d.id)}
                      disabled={broadcasting === d.id}
                      className="text-[#229ED9] text-xs font-semibold hover:text-white transition-colors"
                    >
                      {broadcasting === d.id ? "Sending..." : "Announce"}
                    </button>
                  )}
                  <button
                    onClick={() => handleUndoHistoryEntry(d.id)}
                    className="text-[#64748B] text-xs hover:text-[#EF476F] transition-colors"
                  >
                    Undo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
