"use client";

export default function AnimatedCheck() {
  return (
    <div className="check-circle w-20 h-20 mx-auto mb-4 rounded-full bg-[#0F5132] flex items-center justify-center shadow-lg shadow-[#0F5132]/30">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          className="check-mark"
          d="M10 21 L17 28 L30 13"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
