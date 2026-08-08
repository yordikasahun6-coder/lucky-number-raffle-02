"use client";

import { useState, useEffect } from "react";
import StorageStats from "./StorageStats";
import JSZip from "jszip";

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

  useEffect(() => {
    fetch("/api/admin/screenshots")
      .then((res) => res.json())
      .then((result) => {
        setPayments(result.payments || []);
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
    const res = await fetch(`/api/admin/screenshots/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPayments(payments.filter((p) => p.id !== id));
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
    <main className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <StorageStats />

        <div className="flex items-baseline justify-between mb-6 border-b border-[#232D42] pb-6">
          <div>
            <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#7C879C] uppercase mb-2">
              Backup
            </p>
            <h1 className="[font-family:var(--font-fraunces)] text-3xl text-[#EDEFF3]">
              Payment screenshots
            </h1>
          </div>
          <button
            onClick={downloadAll}
            disabled={zipping || payments.length === 0}
            className="rounded bg-[#D4A24C] text-[#0B0F17] text-sm font-medium px-4 py-2.5 disabled:opacity-50"
          >
            {zipping
              ? `Zipping... ${zipProgress}%`
              : `Download all (${payments.length})`}
          </button>
        </div>

        {loading ? (
          <p className="text-[#7C879C] text-sm [font-family:var(--font-mono)]">
            Loading...
          </p>
        ) : payments.length === 0 ? (
          <p className="text-[#7C879C] text-sm [font-family:var(--font-mono)]">
            No screenshots uploaded yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="rounded bg-[#141B29] border border-[#232D42] p-3 flex items-center gap-3"
              >
                <img
                  src={`/api/payments/screenshot?path=${encodeURIComponent(p.screenshot_url)}`}
                  alt=""
                  className="w-14 h-14 rounded object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[#EDEFF3] text-sm truncate">
                    {p.customer_name}
                  </p>
                  <p className="[font-family:var(--font-mono)] text-xs text-[#7C879C]">
                    {p.phone_number} · {p.status}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <a
                    href={`/api/payments/screenshot?path=${encodeURIComponent(p.screenshot_url)}&download=1`}
                    className="text-[#D4A24C] text-xs underline"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => deleteScreenshot(p.id)}
                    className="text-[#E15B4F] text-xs underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
