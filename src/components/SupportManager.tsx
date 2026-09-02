"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  response_time: string;
  telegram_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  email: string | null;
  active: boolean;
  display_order: number;
};

export default function SupportManager({
  initialMembers,
}: {
  initialMembers: Member[];
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responseTime, setResponseTime] = useState("a few hours");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setResponseTime("a few hours");
    setTelegramUrl("");
    setInstagramUrl("");
    setWhatsappUrl("");
    setEmail("");
    setAvatar(null);
    setAvatarPreview(null);
    setError("");
  }

  function startEdit(m: Member) {
    setEditingId(m.id);
    setName(m.name);
    setDescription(m.description || "");
    setResponseTime(m.response_time);
    setTelegramUrl(m.telegram_url || "");
    setInstagramUrl(m.instagram_url || "");
    setWhatsappUrl(m.whatsapp_url || "");
    setEmail(m.email || "");
    setAvatarPreview(m.avatar_url);
    setAvatar(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function handleFilePreview(file: File) {
    setAvatar(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("response_time", responseTime);
    formData.append("telegram_url", telegramUrl);
    formData.append("instagram_url", instagramUrl);
    formData.append("whatsapp_url", whatsappUrl);
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/support/${editingId}`, {
          method: "PATCH",
          body: formData,
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Could not save.");
        const res2 = await fetch("/api/admin/support");
        const data = await res2.json();
        setMembers(data.members || []);
      } else {
        const res = await fetch("/api/admin/support", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Could not save.");
        setMembers([...members, result.member]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Could not save.");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    setMembers(
      members.map((m) => (m.id === id ? { ...m, active: !current } : m)),
    );
  }

  async function remove(id: string) {
    if (!confirm("Delete this team member?")) return;
    await fetch(`/api/admin/support/${id}`, { method: "DELETE" });
    setMembers(members.filter((m) => m.id !== id));
    if (editingId === id) resetForm();
  }

  async function move(id: string, direction: "up" | "down") {
    const index = members.findIndex((m) => m.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= members.length) return;

    const reordered = [...members];
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];

    await Promise.all(
      reordered.map((m, i) =>
        fetch(`/api/admin/support/${m.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: i }),
        }),
      ),
    );
    setMembers(reordered.map((m, i) => ({ ...m, display_order: i })));
  }

  function channelCount(m: Member) {
    return [m.telegram_url, m.instagram_url, m.whatsapp_url, m.email].filter(
      Boolean,
    ).length;
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">Support team</h1>
        <p className="text-[#9AA7BC] text-sm">
          Manage the support team members shown to customers on the homepage.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[#F5F7FA] font-semibold">Existing team members</p>
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
          + Add team member
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {members.map((m, i) => (
          <div
            key={m.id}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 flex items-center gap-4"
          >
            {m.avatar_url ? (
              <img
                src={m.avatar_url}
                alt={m.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#29164F] flex items-center justify-center text-lg shrink-0">
                🎧
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[#F5F7FA] font-semibold truncate">{m.name}</p>
              <p className="text-[#9AA7BC] text-xs truncate">
                {channelCount(m)} channel{channelCount(m) !== 1 ? "s" : ""}{" "}
                connected · replies in {m.response_time}
              </p>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => move(m.id, "up")}
                disabled={i === 0}
                className="w-6 h-6 rounded bg-[#172133] text-[#9AA7BC] text-xs disabled:opacity-20 hover:text-[#8B4DFF] transition-colors"
              >
                ▲
              </button>
              <button
                onClick={() => move(m.id, "down")}
                disabled={i === members.length - 1}
                className="w-6 h-6 rounded bg-[#172133] text-[#9AA7BC] text-xs disabled:opacity-20 hover:text-[#8B4DFF] transition-colors"
              >
                ▼
              </button>
            </div>

            <button
              onClick={() => toggleActive(m.id, m.active)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full text-xs font-semibold px-3.5 py-1.5 transition-colors ${
                m.active
                  ? "bg-[#123522] border border-[#22C55E]/40 text-[#22C55E]"
                  : "bg-[#172133] border border-[#26344A] text-[#64748B]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
              {m.active ? "Active" : "Hidden"}
            </button>

            <button
              onClick={() => startEdit(m)}
              className="shrink-0 w-9 h-9 rounded-lg bg-[#172133] border border-[#26344A] flex items-center justify-center text-[#9AA7BC] hover:border-[#6D35D8] hover:text-[#8B4DFF] transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => remove(m.id)}
              className="shrink-0 w-9 h-9 rounded-lg bg-[#351722] border border-[#EF476F]/30 flex items-center justify-center text-[#EF476F] hover:bg-[#EF476F] hover:text-white transition-colors"
            >
              🗑
            </button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-[#64748B] text-sm">
            No team members yet — customers won't see a support section until
            you add one.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-[#131C2B] border-2 border-[#6D35D8]/40 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#8B4DFF]">🎧</span>
          <p className="text-[#8B4DFF] font-semibold">
            {editingId ? "Edit team member" : "Add team member"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Name / role
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customer support"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Description <span className="text-[#64748B]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. General support for all your questions."
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Response time
              </label>
              <input
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                placeholder="a few hours"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Avatar <span className="text-[#64748B]">(optional)</span>
            </label>
            <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#26344A] hover:border-[#6D35D8] transition-colors h-[calc(100%-1.75rem)] min-h-[160px] text-center px-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <>
                  <span className="text-3xl">🎧</span>
                  <span className="text-[#F5F7FA] text-sm font-medium">
                    Click to upload photo
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

        <div className="border-t border-[#26344A] mt-6 pt-6">
          <p className="text-[#F5F7FA] text-sm font-semibold mb-4">
            Contact channels — leave blank to hide that button
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9AA7BC] mb-1.5">
                ✈️ Telegram link
              </label>
              <input
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/username"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9AA7BC] mb-1.5">
                📷 Instagram link
              </label>
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/username"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9AA7BC] mb-1.5">
                💬 WhatsApp link
              </label>
              <input
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://wa.me/251912345678"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9AA7BC] mb-1.5">
                ✉️ Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@luckyticket.com"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-[#EF476F] text-xs mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1.5 rounded-xl border border-[#26344A] text-[#9AA7BC] text-sm px-5 py-2.5 hover:border-[#6D35D8] transition-colors"
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
                ? "Update Member"
                : "💾 Save Member"}
          </button>
        </div>
      </form>
    </main>
  );
}
