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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setError("");
  }

  function startEdit(p: Prize) {
    setEditingId(p.id);
    setTitle(p.title);
    setAmount(p.amount);
    setDescription(p.description || "");
    setImagePreview(p.image_url);
    setImage(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function handleFilePreview(file: File) {
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
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

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/prizes/${editingId}`, {
          method: "PATCH",
          body: formData,
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Could not save.");
        const res2 = await fetch("/api/admin/prizes");
        const data = await res2.json();
        setPrizes(data.prizes || []);
      } else {
        const res = await fetch("/api/admin/prizes", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Could not save.");
        setPrizes([...prizes, result.prize]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Could not save.");
    }
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
    if (editingId === id) resetForm();
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
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">Prizes</h1>
        <p className="text-[#9AA7BC] text-sm">
          Manage the prizes shown to customers on the homepage.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#D9A63A] mt-3" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[#F5F7FA] font-semibold">Existing prizes</p>
        <button
          onClick={() => {
            resetForm();
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Add new prize
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {prizes.map((p, i) => (
          <div
            key={p.id}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-4 flex flex-wrap items-center gap-3"
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#3A2E10] flex items-center justify-center text-[#D9A63A] text-lg shrink-0">
                🏆
              </div>
            )}

            <div className="flex-1 min-w-[140px]">
              <p className="text-[#F5F7FA] font-semibold truncate">{p.title}</p>
              <p className="[font-family:var(--font-mono)] text-sm text-[#D9A63A] font-bold">
                {p.amount}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => move(p.id, "up")}
                  disabled={i === 0}
                  className="w-6 h-6 rounded bg-[#172133] text-[#9AA7BC] text-xs disabled:opacity-20 hover:text-[#8B4DFF] transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(p.id, "down")}
                  disabled={i === prizes.length - 1}
                  className="w-6 h-6 rounded bg-[#172133] text-[#9AA7BC] text-xs disabled:opacity-20 hover:text-[#8B4DFF] transition-colors"
                >
                  ▼
                </button>
              </div>

              <button
                onClick={() => toggleActive(p.id, p.active)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full text-xs font-semibold px-3.5 py-1.5 transition-colors ${
                  p.active
                    ? "bg-[#123522] border border-[#22C55E]/40 text-[#22C55E]"
                    : "bg-[#172133] border border-[#26344A] text-[#64748B]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
                {p.active ? "Active" : "Hidden"}
              </button>

              <button
                onClick={() => startEdit(p)}
                className="shrink-0 w-9 h-9 rounded-lg bg-[#172133] border border-[#26344A] flex items-center justify-center text-[#9AA7BC] hover:border-[#6D35D8] hover:text-[#8B4DFF] transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(p.id)}
                className="shrink-0 w-9 h-9 rounded-lg bg-[#351722] border border-[#EF476F]/30 flex items-center justify-center text-[#EF476F] hover:bg-[#EF476F] hover:text-white transition-colors"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {prizes.length === 0 && (
          <p className="text-[#64748B] text-sm">
            No prizes added yet — customers won't see a prize section until you
            add one.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-[#131C2B] border-2 border-[#D9A63A]/40 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#D9A63A]">🏆</span>
          <p className="text-[#D9A63A] font-semibold">
            {editingId ? "Edit prize" : "Add new prize"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Prize title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Prize"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#D9A63A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Amount
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 60,000 ETB"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#D9A63A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Description <span className="text-[#64748B]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional short description"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#D9A63A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Prize image <span className="text-[#64748B]">(optional)</span>
            </label>
            <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#26344A] hover:border-[#D9A63A] transition-colors h-[calc(100%-1.75rem)] min-h-[220px] text-center px-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="max-h-40 max-w-full object-contain rounded"
                />
              ) : (
                <>
                  <span className="w-11 h-11 rounded-full bg-[#3A2E10] flex items-center justify-center text-[#D9A63A] text-lg">
                    🏆
                  </span>
                  <span className="text-[#F5F7FA] text-sm font-medium">
                    Click to upload prize image
                  </span>
                  <span className="text-[#64748B] text-xs">
                    PNG, JPG (max 2MB)
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFilePreview(f);
                }}
              />
            </label>
          </div>
        </div>

        {error && <p className="text-[#EF476F] text-xs mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1.5 rounded-xl border border-[#26344A] text-[#9AA7BC] text-sm px-5 py-2.5 hover:border-[#D9A63A] transition-colors"
          >
            ✕ Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-6 py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Prize"
                : "💾 Save Prize"}
          </button>
        </div>
      </form>
    </main>
  );
}
