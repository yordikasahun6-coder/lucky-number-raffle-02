"use client";

import { useState, useEffect } from "react";

type Admin = {
  id: string;
  username: string;
  display_name: string;
  active: boolean;
};

export default function TeamClient() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsOwner(data.isOwner || false));
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    setAdmins(data.admins || []);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password || !displayName) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, display_name: displayName }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Could not add admin.");
      setSaving(false);
      return;
    }

    setAdmins([...admins, result.admin]);
    setUsername("");
    setDisplayName("");
    setPassword("");
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    setAdmins(
      admins.map((a) => (a.id === id ? { ...a, active: !current } : a)),
    );
  }

  async function remove(id: string) {
    if (!confirm("Remove this team member's access?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    setAdmins(admins.filter((a) => a.id !== id));
  }

  if (isOwner === false) {
    return (
      <main className="px-6 py-8 md:px-10 md:py-10">
        <div className="rounded-2xl bg-[#351722] border border-[#EF476F]/40 p-6 text-center max-w-md mx-auto mt-10">
          <p className="text-[#EF476F] font-semibold mb-1">Access restricted</p>
          <p className="text-[#F5B8C6] text-sm">
            Only the Owner can manage team access.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">Team access</h1>
        <p className="text-[#9AA7BC] text-sm">
          Give people you trust their own login. Every approval shows who did
          it.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>

      <div className="rounded-2xl bg-[#131C2B] border border-[#26344A] px-5 py-4 flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#29164F] flex items-center justify-center text-lg shrink-0">
          👑
        </div>
        <div className="flex-1">
          <p className="text-[#F5F7FA] font-semibold">Owner</p>
          <p className="text-[#9AA7BC] text-xs">
            Master login — always works using your admin password.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[#F5F7FA] font-semibold">Team members</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Add team member
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {admins.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-4 flex flex-wrap items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#29164F] flex items-center justify-center text-lg shrink-0">
              🧑
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-[#F5F7FA] font-semibold">{a.display_name}</p>
              <p className="[font-family:var(--font-mono)] text-xs text-[#9AA7BC]">
                @{a.username}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => toggleActive(a.id, a.active)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full text-xs font-semibold px-3.5 py-1.5 transition-colors ${
                  a.active
                    ? "bg-[#123522] border border-[#22C55E]/40 text-[#22C55E]"
                    : "bg-[#172133] border border-[#26344A] text-[#64748B]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
                {a.active ? "Active" : "Disabled"}
              </button>
              <button
                onClick={() => remove(a.id)}
                className="shrink-0 w-9 h-9 rounded-lg bg-[#351722] border border-[#EF476F]/30 flex items-center justify-center text-[#EF476F] hover:bg-[#EF476F] hover:text-white transition-colors"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {admins.length === 0 && (
          <p className="text-[#64748B] text-sm">
            No additional team members yet.
          </p>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl bg-[#131C2B] border-2 border-[#6D35D8]/40 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Selam"
              className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 text-[#F5F7FA] text-sm placeholder-[#64748B]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. selam"
              className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 [font-family:var(--font-mono)] text-[#F5F7FA] text-sm placeholder-[#64748B]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#F5F7FA] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-[#080D16] border border-[#26344A] px-4 py-2.5 text-[#F5F7FA] text-sm"
            />
          </div>
          {error && <p className="text-[#EF476F] text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-6 py-2.5 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add team member"}
          </button>
        </form>
      )}
    </main>
  );
}
