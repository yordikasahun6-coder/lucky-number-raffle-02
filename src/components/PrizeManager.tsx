"use client";

import { useState } from "react";

type Prize = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  display_order: number;
};

export default function PrizeManager({
  initialPrizes,
}: {
  initialPrizes: Prize[];
}) {
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) {
      setError("Title and amount are required.");
      return;
    }
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", amount);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const res = await fetch("/api/admin/prizes", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Could not save.");
      setSaving(false);
      return;
    }

    setPrizes([...prizes, result.prize]);
    setTitle("");
    setAmount("");
    setDescription("");
    setImage(null);
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/prizes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    setPrizes(
      prizes.map((p) => (p.id === id ? { ...p, active: !current } : p)),
    );
  }

  async function remove(id: string) {
    if (!confirm("Delete this prize?")) return;
    await fetch(`/api/admin/prizes/${id}`, { method: "DELETE" });
    setPrizes(prizes.filter((p) => p.id !== id));
  }

  async function move(id: string, direction: "up" | "down") {
    const index = prizes.findIndex((p) => p.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= prizes.length) return;

    const reordered = [...prizes];
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];

    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/admin/prizes/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: i }),
        }),
      ),
    );
    setPrizes(reordered.map((p, i) => ({ ...p, display_order: i })));
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {prizes.map((p, i) => (
          <div
            key={p.id}
            className="rounded bg-[#141B29] border border-[#232D42] p-4 flex items-center gap-4"
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.title}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-[#232D42] flex items-center justify-center text-[#7C879C] text-xs">
                🏆
              </div>
            )}
            <div className="flex-1">
              <p className="text-[#EDEFF3] text-sm font-medium">{p.title}</p>
              <p className="[font-family:var(--font-mono)] text-xs text-[#D4A24C]">
                {p.amount}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => move(p.id, "up")}
                disabled={i === 0}
                className="text-[#7C879C] text-xs disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => move(p.id, "down")}
                disabled={i === prizes.length - 1}
                className="text-[#7C879C] text-xs disabled:opacity-20"
              >
                ▼
              </button>
            </div>
            <button
              onClick={() => toggleActive(p.id, p.active)}
              className={`text-xs px-3 py-1.5 rounded ${p.active ? "bg-[#4FBF8B]/10 text-[#4FBF8B]" : "bg-[#232D42] text-[#7C879C]"}`}
            >
              {p.active ? "Active" : "Hidden"}
            </button>
            <button
              onClick={() => remove(p.id)}
              className="text-[#E15B4F] text-xs px-2"
            >
              Delete
            </button>
          </div>
        ))}
        {prizes.length === 0 && (
          <p className="text-[#7C879C] text-sm">
            No prizes added yet — customers won't see a prize section until you
            add one.
          </p>
        )}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-[#D4A24C] text-[#0B0F17] font-medium px-5 py-2.5 text-sm"
        >
          + Add prize
        </button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="rounded bg-[#141B29] border border-[#232D42] p-5 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prize title (e.g. Grand Prize)"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (e.g. 50,000 ETB)"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description"
            rows={2}
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full text-sm text-[#7C879C]"
          />
          {error && <p className="text-[#E15B4F] text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#D4A24C] text-[#0B0F17] text-sm font-medium px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#7C879C] text-sm px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
