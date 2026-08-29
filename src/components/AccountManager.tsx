"use client";

import { useState } from "react";

type Account = {
  id: string;
  name: string;
  account_holder: string;
  account_number: string;
  logo_url: string | null;
  qr_code_url: string | null;
  active: boolean;
};

export default function AccountManager({
  initialAccounts,
}: {
  initialAccounts: Account[];
}) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setHolder("");
    setNumber("");
    setLogo(null);
    setQrCode(null);
    setLogoPreview(null);
    setQrPreview(null);
    setError("");
  }

  function startEdit(a: Account) {
    setEditingId(a.id);
    setName(a.name);
    setHolder(a.account_holder);
    setNumber(a.account_number);
    setLogoPreview(a.logo_url);
    setQrPreview(a.qr_code_url);
    setLogo(null);
    setQrCode(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function handleFilePreview(
    file: File,
    setFile: (f: File) => void,
    setPreview: (s: string) => void,
  ) {
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !holder || !number) {
      setError("Fill in method name, account holder, and account number.");
      return;
    }
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("account_holder", holder);
    formData.append("account_number", number);
    if (logo) formData.append("logo", logo);
    if (qrCode) formData.append("qr_code", qrCode);

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/accounts/${editingId}`, {
          method: "PATCH",
          body: formData,
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Could not save.");
        const res2 = await fetch("/api/admin/accounts");
        const data = await res2.json();
        setAccounts(data.accounts || []);
      } else {
        const res = await fetch("/api/admin/accounts", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Could not save.");
        setAccounts([...accounts, result.account]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Could not save.");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    setAccounts(
      accounts.map((a) => (a.id === id ? { ...a, active: !current } : a)),
    );
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment method?")) return;
    await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    setAccounts(accounts.filter((a) => a.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          Payment methods
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Manage payment methods used by users to purchase tickets.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[#F5F7FA] font-semibold">Existing payment methods</p>
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
          + Add new method
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 flex items-center gap-4"
          >
            <span className="text-[#64748B] cursor-grab select-none text-sm tracking-widest">
              ⠿⠿⠿
            </span>

            {a.logo_url ? (
              <img
                src={a.logo_url}
                alt={a.name}
                className="w-11 h-11 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#172133] shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[#F5F7FA] font-semibold truncate">{a.name}</p>
              <p className="[font-family:var(--font-mono)] text-xs text-[#9AA7BC]">
                {a.account_holder} <span className="text-[#64748B]">•</span>{" "}
                {a.account_number}
              </p>
              {a.qr_code_url && (
                <p className="text-[#22C55E] text-xs mt-0.5">
                  ✓ QR code attached
                </p>
              )}
            </div>

            <button
              onClick={() => toggleActive(a.id, a.active)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full text-xs font-semibold px-3.5 py-1.5 transition-colors ${
                a.active
                  ? "bg-[#123522] border border-[#22C55E]/40 text-[#22C55E]"
                  : "bg-[#172133] border border-[#26344A] text-[#64748B]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
              {a.active ? "Active" : "Hidden"}
            </button>

            <button
              onClick={() => startEdit(a)}
              className="shrink-0 w-9 h-9 rounded-lg bg-[#172133] border border-[#26344A] flex items-center justify-center text-[#9AA7BC] hover:border-[#6D35D8] hover:text-[#8B4DFF] transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => remove(a.id)}
              className="shrink-0 w-9 h-9 rounded-lg bg-[#351722] border border-[#EF476F]/30 flex items-center justify-center text-[#EF476F] hover:bg-[#EF476F] hover:text-white transition-colors"
            >
              🗑
            </button>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-[#64748B] text-sm">
            No payment methods yet — customers will see nothing until you add
            one.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-[#131C2B] border-2 border-[#6D35D8]/40 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#8B4DFF]">💳</span>
          <p className="text-[#8B4DFF] font-semibold">
            {editingId ? "Edit payment method" : "Add new payment method"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Method name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Commercial Bank of Ethiopia"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Account holder name
              </label>
              <input
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="Full name of account holder"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Account number
              </label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-3 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#6D35D8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                Logo <span className="text-[#64748B]">(optional)</span>
              </label>
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#26344A] hover:border-[#6D35D8] transition-colors h-36 text-center px-2">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt=""
                    className="max-h-20 max-w-full object-contain rounded"
                  />
                ) : (
                  <>
                    <span className="w-9 h-9 rounded-full bg-[#29164F] flex items-center justify-center text-[#8B4DFF]">
                      ⬆
                    </span>
                    <span className="text-[#F5F7FA] text-xs font-medium">
                      Click to upload logo
                    </span>
                    <span className="text-[#64748B] text-[10px]">
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
                    if (f) handleFilePreview(f, setLogo, setLogoPreview);
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm text-[#F5F7FA] mb-1.5">
                QR Code <span className="text-[#64748B]">(optional)</span>
              </label>
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#26344A] hover:border-[#6D35D8] transition-colors h-36 text-center px-2">
                {qrPreview ? (
                  <img
                    src={qrPreview}
                    alt=""
                    className="max-h-20 max-w-full object-contain rounded"
                  />
                ) : (
                  <>
                    <span className="w-9 h-9 rounded-full bg-[#29164F] flex items-center justify-center text-[#8B4DFF]">
                      ▦
                    </span>
                    <span className="text-[#F5F7FA] text-xs font-medium">
                      Click to upload QR code
                    </span>
                    <span className="text-[#64748B] text-[10px]">
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
                    if (f) handleFilePreview(f, setQrCode, setQrPreview);
                  }}
                />
              </label>
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
                ? "Update Method"
                : "💾 Save Method"}
          </button>
        </div>
      </form>
    </main>
  );
}
