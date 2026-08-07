"use client";

const items = [
  {
    emoji: "🪙",
    top: "8%",
    left: "8%",
    size: "text-2xl",
    duration: "6.5s",
    delay: "0s",
  },
  {
    emoji: "🍀",
    top: "18%",
    left: "88%",
    size: "text-xl",
    duration: "8s",
    delay: "0.5s",
  },
  {
    emoji: "✨",
    top: "30%",
    left: "15%",
    size: "text-base",
    duration: "5.5s",
    delay: "1s",
  },
  {
    emoji: "🪙",
    top: "45%",
    left: "92%",
    size: "text-xl",
    duration: "7s",
    delay: "0.3s",
  },
  {
    emoji: "✨",
    top: "12%",
    left: "55%",
    size: "text-sm",
    duration: "6s",
    delay: "1.4s",
  },
  {
    emoji: "🍀",
    top: "60%",
    left: "6%",
    size: "text-2xl",
    duration: "9s",
    delay: "0.8s",
  },
  {
    emoji: "✨",
    top: "75%",
    left: "90%",
    size: "text-base",
    duration: "6.5s",
    delay: "0.2s",
  },
  {
    emoji: "🪙",
    top: "85%",
    left: "20%",
    size: "text-xl",
    duration: "7.5s",
    delay: "1.1s",
  },
  {
    emoji: "✨",
    top: "55%",
    left: "48%",
    size: "text-sm",
    duration: "5s",
    delay: "1.7s",
  },
  {
    emoji: "🍀",
    top: "92%",
    left: "70%",
    size: "text-xl",
    duration: "8.5s",
    delay: "0.6s",
  },
];

export default function CelebrationAmbience() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((it, i) => (
        <span
          key={i}
          className={`ambient-item absolute ${it.size}`}
          style={{
            top: it.top,
            left: it.left,
            animationDuration: it.duration,
            animationDelay: it.delay,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
