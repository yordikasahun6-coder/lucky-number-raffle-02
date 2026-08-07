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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !holder || !number) {
      setError("Fill in all fields.");
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

    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Could not save.");
      setSaving(false);
      return;
    }

    setAccounts([...accounts, result.account]);
    setName("");
    setHolder("");
    setNumber("");
    setLogo(null);
    setQrCode(null);
    setShowForm(false);
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
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded bg-[#141B29] border border-[#232D42] p-4 flex items-center gap-4"
          >
            {a.logo_url ? (
              <img
                src={a.logo_url}
                alt={a.name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-[#232D42]" />
            )}
            <div className="flex-1">
              <p className="text-[#EDEFF3] text-sm font-medium">{a.name}</p>
              <p className="[font-family:var(--font-mono)] text-xs text-[#7C879C]">
                {a.account_holder} · {a.account_number}
              </p>
              {a.qr_code_url && (
                <p className="text-[10px] text-[#4FBF8B] mt-0.5">
                  ✓ QR code attached
                </p>
              )}
            </div>
            <button
              onClick={() => toggleActive(a.id, a.active)}
              className={`text-xs px-3 py-1.5 rounded ${a.active ? "bg-[#4FBF8B]/10 text-[#4FBF8B]" : "bg-[#232D42] text-[#7C879C]"}`}
            >
              {a.active ? "Active" : "Hidden"}
            </button>
            <button
              onClick={() => remove(a.id)}
              className="text-[#E15B4F] text-xs px-2"
            >
              Delete
            </button>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-[#7C879C] text-sm">
            No payment methods yet — customers will see nothing to pay to until
            you add one.
          </p>
        )}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-[#D4A24C] text-[#0B0F17] font-medium px-5 py-2.5 text-sm"
        >
          + Add payment method
        </button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="rounded bg-[#141B29] border border-[#232D42] p-5 space-y-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Method name (e.g. Commercial Bank of Ethiopia)"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <input
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Account holder name"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Account number"
            className="w-full rounded bg-[#0B0F17] border border-[#232D42] px-3 py-2 text-[#EDEFF3] text-sm placeholder-[#4A5468]"
          />
          <div>
            <label className="block text-xs text-[#7C879C] mb-1.5">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
              className="w-full text-sm text-[#7C879C] file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A24C] file:text-[#0B0F17] file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-[#E0AF5C] file:transition-colors"
            />
            {logo && (
              <p className="text-[10px] text-[#4FBF8B] mt-1">✓ {logo.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-[#7C879C] mb-1.5">
              QR code (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setQrCode(e.target.files?.[0] || null)}
              className="w-full text-sm text-[#7C879C] file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A24C] file:text-[#0B0F17] file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-[#E0AF5C] file:transition-colors"
            />
            {qrCode && (
              <p className="text-[10px] text-[#4FBF8B] mt-1">✓ {qrCode.name}</p>
            )}
          </div>
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
