"use client";

import { useState, useEffect } from "react";

export default function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((res) => res.json())
      .then((data) => setIsAvailable(data.isAvailable))
      .catch(() => {});
  }, []);

  async function toggle() {
    if (isAvailable === null) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !isAvailable }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error);
      setSaving(false);
      setTimeout(() => setError(""), 5000);
      return;
    }

    setIsAvailable(result.isAvailable);
    setSaving(false);
  }

  if (isAvailable === null) return null;

  return (
    <div className="px-2 mb-2">
      <button
        onClick={toggle}
        disabled={saving}
        className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isAvailable
            ? "bg-[#123522] border border-[#22C55E]/40 text-[#22C55E]"
            : "bg-[#172133] border border-[#26344A] text-[#64748B]"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${isAvailable ? "bg-[#22C55E]" : "bg-[#64748B]"}`}
        />
        {isAvailable ? "Available to customers" : "Currently offline"}
      </button>
      {error && <p className="text-[#EF476F] text-[10px] mt-1.5">{error}</p>}
    </div>
  );
}
