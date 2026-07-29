"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="max-w-xs w-full">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2 text-center">
          Admin
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-2xl text-[#EDEFF3] mb-6 text-center">
          Sign in
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded bg-[#141B29] border border-[#232D42] px-4 py-3 text-[#EDEFF3] placeholder-[#4A5468] focus:outline-none focus:border-[#D4A24C] mb-3"
        />
        {error && <p className="text-[#E15B4F] text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#D4A24C] text-[#0B0F17] font-medium py-3 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
