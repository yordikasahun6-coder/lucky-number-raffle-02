"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";
import StorageStats from "./StorageStats";

type PaymentRow = {
  id: string;
  customer_name: string;
  phone_number: string;
  reference_number: string | null;
  status: string;
  screenshot_url: string;
  submitted_at: string;
};

export default function ScreenshotsClient() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/screenshots")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch screenshots");
        return res.json();
      })
      .then((result) => {
        setPayments(result.payments || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching screenshots:", error);
        setLoading(false);
      });
  }, []);

  async function deleteScreenshot(id: string) {
    if (
      !confirm(
        "Delete this screenshot? Make sure you already downloaded it if needed — this cannot be undone.",
      )
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/screenshots/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPayments(payments.filter((p) => p.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete screenshot");
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadAll() {
    setZipping(true);
    setZipProgress(0);
    const zip = new JSZip();

    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      try {
        const res = await fetch(
          `/api/payments/screenshot?path=${encodeURIComponent(p.screenshot_url)}&download=1`,
        );
        if (!res.ok) throw new Error("Failed to fetch screenshot");
        const blob = await res.blob();
        const ext = p.screenshot_url.split(".").pop() || "jpg";
        const safeName = p.phone_number.replace(/[^0-9]/g, "");
        zip.file(
          `${safeName}-${p.reference_number || "noref"}-${p.id.slice(0, 6)}.${ext}`,
          blob,
        );
      } catch {
        // skip any single failed file rather than aborting the whole export
      }
      setZipProgress(Math.round(((i + 1) / payments.length) * 100));
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-screenshots-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setZipping(false);
  }

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <StorageStats />

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
            Backup
          </p>
          <h1 className="[font-family:var(--font-fraunces)] text-4xl font-bold text-[#F5F7FA]">
            Payment screenshots
          </h1>
        </div>
        <button
          onClick={downloadAll}
          disabled={zipping || payments.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A63A] to-[#F2C14E] text-[#0B111C] text-sm font-bold px-5 py-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {zipping
            ? `⬇ Zipping... ${zipProgress}%`
            : `⬇ Download all (${payments.length})`}
        </button>
      </div>

      {loading ? (
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          Loading...
        </p>
      ) : payments.length === 0 ? (
        <p className="text-[#64748B] text-sm [font-family:var(--font-mono)]">
          No screenshots uploaded yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-[#131C2B] border border-[#26344A] p-4 flex items-center gap-4"
            >
              <div className="relative shrink-0">
                <img
                  src={`/api/payments/screenshot?path=${encodeURIComponent(p.screenshot_url)}`}
                  alt={`Screenshot for ${p.customer_name}`}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                {p.status === "approved" && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#22C55E] border-2 border-[#131C2B] flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[#F5F7FA] font-semibold truncate">
                  {p.customer_name}
                </p>
                <p className="[font-family:var(--font-mono)] text-sm text-[#9AA7BC]">
                  {p.phone_number}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs mt-1 ${
                    p.status === "approved"
                      ? "text-[#22C55E]"
                      : p.status === "rejected"
                        ? "text-[#EF476F]"
                        : "text-[#D9A63A]"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
                  {p.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 items-end shrink-0 text-sm">
                <a
                  href={`/api/payments/screenshot?path=${encodeURIComponent(p.screenshot_url)}&download=1`}
                  className="flex items-center gap-1.5 text-[#D9A63A] hover:text-[#F2C14E] transition-colors"
                >
                  ⬇ Download
                </a>
                <button
                  onClick={() => deleteScreenshot(p.id)}
                  disabled={deletingId === p.id}
                  className="flex items-center gap-1.5 text-[#EF476F] hover:text-[#F5F7FA] transition-colors disabled:opacity-50"
                >
                  {deletingId === p.id ? "⏳ Deleting..." : "🗑 Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
