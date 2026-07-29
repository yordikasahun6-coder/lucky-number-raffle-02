"use client";

import { useState } from "react";

type Asset = { key: string; label: string; image_url: string | null };

export default function AssetManager({
  initialAssets,
}: {
  initialAssets: Asset[];
}) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [uploading, setUploading] = useState<string | null>(null);

  async function handleUpload(key: string, file: File) {
    setUploading(key);
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);

    const res = await fetch("/api/admin/assets", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (res.ok) {
      setAssets(
        assets.map((a) =>
          a.key === key ? { ...a, image_url: result.image_url } : a,
        ),
      );
    }
    setUploading(null);
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {assets.map((a) => (
        <div
          key={a.key}
          className="rounded bg-[#141B29] border border-[#232D42] p-4"
        >
          <p className="text-[#EDEFF3] text-sm font-medium mb-3">{a.label}</p>
          <div className="w-full h-28 rounded bg-[#0B0F17] border border-dashed border-[#2C3750] flex items-center justify-center mb-3 overflow-hidden">
            {a.image_url ? (
              <img
                src={a.image_url}
                alt={a.label}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-[#4A5468] text-xs">not uploaded yet</span>
            )}
          </div>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(a.key, file);
              }}
            />
            <span className="inline-block rounded bg-[#D4A24C] text-[#0B0F17] text-xs font-medium px-3 py-2 cursor-pointer">
              {uploading === a.key
                ? "Uploading..."
                : a.image_url
                  ? "Replace image"
                  : "Upload image"}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}
