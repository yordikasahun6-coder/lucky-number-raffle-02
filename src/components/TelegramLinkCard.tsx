"use client";

import { useState, useEffect } from "react";

export default function TelegramLinkCard() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/telegram-link");
    const data = await res.json();
    setLinked(data.linked);
    setLinkCode(data.linkCode);
    setBotUsername(data.botUsername);
  }

  async function generate() {
    setGenerating(true);
    const res = await fetch("/api/admin/telegram-link", { method: "POST" });
    const data = await res.json();
    setLinkCode(data.linkCode);
    setBotUsername(data.botUsername);
    setGenerating(false);
  }

  if (linked === null) return null;

  return (
    <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-[#0d3a52] flex items-center justify-center text-[#229ED9]">
          ✈️
        </span>
        <div>
          <p className="text-[#F5F7FA] font-semibold">Telegram notifications</p>
          <p className="text-[#64748B] text-xs">
            {linked
              ? "Connected — you'll get new-payment alerts"
              : "Not connected yet"}
          </p>
        </div>
      </div>

      {linked ? (
        <div className="rounded-xl bg-[#123522] border border-[#22C55E]/40 px-4 py-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="text-[#22C55E] text-sm font-medium">Connected</span>
        </div>
      ) : linkCode ? (
        <div className="space-y-3">
          <p className="text-[#9AA7BC] text-sm">
            1. Open Telegram and message our bot
            {botUsername ? ` (@${botUsername})` : ""}
            <br />
            2. Send this exact message:
          </p>
          <div className="rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 [font-family:var(--font-mono)] text-[#D9A63A] text-sm text-center select-all">
            /link {linkCode}
          </div>
          <button
            onClick={load}
            className="w-full rounded-xl border border-[#26344A] text-[#9AA7BC] text-sm px-4 py-2.5 hover:border-[#6D35D8] transition-colors"
          >
            I've sent it — check again
          </button>
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={generating}
          className="w-full rounded-xl bg-gradient-to-r from-[#229ED9] to-[#1B8BC0] text-white text-sm font-semibold px-5 py-3 disabled:opacity-50"
        >
          {generating ? "Generating..." : "🔗 Connect my Telegram"}
        </button>
      )}
    </div>
  );
}
