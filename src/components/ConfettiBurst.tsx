"use client";

const colors = [
  "#E0A72E",
  "#0F5132",
  "#4FBF8B",
  "#E15B4F",
  "#5B8AE0",
  "#D4A24C",
];

export default function ConfettiBurst() {
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const distance = 60 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 20;
    const tr = Math.random() * 360;
    return {
      tx,
      ty,
      tr,
      color: colors[i % colors.length],
      delay: Math.random() * 0.15,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-burst-piece absolute left-1/2 top-1/2 w-1.5 h-3 rounded-sm"
          style={{
            backgroundColor: p.color,
            // @ts-expect-error custom properties for the keyframe
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--tr": `${p.tr}deg`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
