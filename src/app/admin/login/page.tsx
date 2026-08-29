"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    <main className="min-h-screen bg-[#070D18] flex">
      {/* Left brand panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[420px] shrink-0 relative overflow-hidden border-r border-[#26344A] flex-col justify-between px-10 py-12">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#7C3AED] opacity-20 blur-3xl" />
          <div className="absolute top-1/3 -left-10 text-5xl opacity-20 -rotate-12">
            🎫
          </div>
          <div className="absolute bottom-1/3 -right-6 text-5xl opacity-20 rotate-12">
            🎫
          </div>
        </div>

        <div>
          <div className="flex justify-center mb-6">
            <span className="text-6xl drop-shadow-[0_0_20px_rgba(217,166,58,0.5)]">
              🎫
            </span>
          </div>
          <h1 className="text-center text-2xl font-bold mb-1">
            <span className="text-[#F5F7FA]">LUCKY </span>
            <span className="text-[#D9A63A]">TICKET</span>
          </h1>
          <p className="text-center [font-family:var(--font-mono)] text-xs tracking-[0.2em] text-[#9B4DFF] mb-6">
            ADMIN PANEL
          </p>
          <div className="w-16 h-0.5 bg-[#7C3AED] mx-auto mb-6" />
          <p className="text-center text-[#A8B3C5] text-sm leading-relaxed max-w-[240px] mx-auto">
            Manage ticket claims, payments and winners all in one secure admin
            dashboard.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0B1220] border border-[#26344A] p-4 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#24134A] flex items-center justify-center text-[#9B4DFF] shrink-0">
            🔒
          </span>
          <div>
            <p className="text-[#F5F7FA] text-sm font-semibold">
              Secure & Trusted
            </p>
            <p className="text-[#64748B] text-xs mt-0.5">
              Only authorized admin can access this panel.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-[#0B1220] border border-[#26344A] p-8">
            <div className="flex justify-center mb-4">
              <span className="w-16 h-16 rounded-full bg-[#24134A] border border-[#7C3AED]/40 flex items-center justify-center text-2xl text-[#9B4DFF]">
                🛡️
              </span>
            </div>

            <p className="text-center [font-family:var(--font-mono)] text-xs tracking-[0.2em] text-[#9B4DFF] mb-2">
              ADMIN
            </p>
            <h2 className="text-center text-2xl font-bold text-[#F5F7FA] mb-1">
              Welcome back!
            </h2>
            <p className="text-center text-[#A8B3C5] text-sm mb-6">
              Sign in to access your admin dashboard
            </p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#26344A]" />
              <span className="text-[#7C3AED]">✦</span>
              <div className="flex-1 h-px bg-[#26344A]" />
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block text-[#A8B3C5] text-xs font-semibold tracking-wide mb-2">
                PASSWORD
              </label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl bg-[#070D18] border border-[#26344A] px-4 py-3.5 pr-11 text-[#F5F7FA] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#A8B3C5] transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 text-[#A8B3C5] text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#7C3AED]"
                  />
                  Remember me
                </label>
                <span className="text-[#D9A63A] text-sm hover:text-[#F2C14E] transition-colors cursor-default">
                  Forgot password?
                </span>
              </div>

              {error && (
                <p className="text-[#EF476F] text-sm mb-4 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#070D18] font-bold py-3.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                🔒 {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-[#64748B] text-xs flex items-center justify-center gap-1.5">
              🛡️ Your data is 100% secure
            </p>
            <p className="text-[#64748B] text-xs mt-2">
              © 2025 Lucky Ticket. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
