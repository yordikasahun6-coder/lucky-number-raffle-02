"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ScreenshotUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  function handleFile(f: File | null) {
    if (!f) {
      onChange(null);
      setPreview(null);
      return;
    }
    if (!f.type.startsWith("image/")) return;
    if (f.size > 5 * 1024 * 1024) return; // 5MB cap

    onChange(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1.5">
        {t("screenshotLabel")}{" "}
        <span className="text-[#9CA3AF] font-normal">
          {t("screenshotOptional")}
        </span>
      </label>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0] || null);
          }}
          className={`rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition ${
            dragOver
              ? "border-[#16A34A] bg-[#16A34A]/5"
              : "border-[#D1D5DB] hover:border-[#16A34A] hover:bg-[#F9FAFB]"
          }`}
        >
          <div className="w-11 h-11 mx-auto rounded-full bg-[#E7F5EC] flex items-center justify-center mb-2 text-[#16A34A] text-lg">
            ⬆
          </div>
          <p className="text-[#374151] text-sm font-medium">
            Tap to upload or drag a screenshot here
          </p>
          <p className="text-[#9CA3AF] text-xs mt-1">PNG or JPG, up to 5MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[#CFE9D8] bg-[#F0FDF4] p-3 flex items-center gap-3">
          {preview && (
            <img
              src={preview}
              alt="Screenshot preview"
              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#CFE9D8]"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[#166534] text-sm font-medium truncate">
              {file.name}
            </p>
            <p className="text-[#4B7A5B] text-xs">
              {(file.size / 1024).toFixed(0)} KB · attached
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="text-[#E15B4F] text-xs font-medium px-2 py-1 shrink-0"
          >
            Remove
          </button>
        </div>
      )}

      <p className="text-xs text-[#9CA3AF] mt-1.5">{t("screenshotHint")}</p>
    </div>
  );
}
