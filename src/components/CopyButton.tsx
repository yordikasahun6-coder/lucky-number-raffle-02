"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / non-secure contexts where
      // navigator.clipboard isn't available
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`press-scale shrink-0 rounded-md px-2 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors ${
        copied
          ? "bg-[#E7F5EC] text-[#0F5132]"
          : "bg-[#F3EFDD] text-[#8A9A8F] hover:bg-[#EAE1C4] hover:text-[#14231C]"
      }`}
    >
      {copied ? <>✓ Copied</> : <>⧉ Copy</>}
    </button>
  );
}
