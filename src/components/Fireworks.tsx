"use client";

const colors = ["#E0A72E", "#4FBF8B", "#5B8AE0", "#E15B4F", "#D4A24C"];

function Burst({
  top,
  left,
  delay,
  color,
}: {
  top: string;
  left: string;
  delay: number;
  color: string;
}) {
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    return { fx: Math.cos(angle) * dist, fy: -130 + Math.sin(angle) * dist };
  });

  return (
    <div className="absolute" style={{ top, left }}>
      <div
        className="rocket-trail w-1.5 h-4 rounded-full"
        style={{ backgroundColor: color, animationDelay: `${delay}s` }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="firework-particle absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: color,
            animationDelay: `${delay}s`,
            // @ts-expect-error custom properties for the keyframe
            "--fx": `${p.fx}px`,
            "--fy": `${p.fy}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function Fireworks() {
  // Spread across the FULL viewport — different vertical positions
  // (top/middle/bottom) and horizontal positions, not one fixed row.
  const bursts = [
    { top: "15%", left: "10%", delay: 0 },
    { top: "65%", left: "85%", delay: 0.3 },
    { top: "35%", left: "50%", delay: 0.6 },
    { top: "80%", left: "20%", delay: 0.9 },
    { top: "10%", left: "75%", delay: 1.2 },
    { top: "55%", left: "5%", delay: 1.5 },
    { top: "25%", left: "92%", delay: 1.8 },
    { top: "70%", left: "45%", delay: 2.1 },
    { top: "45%", left: "15%", delay: 2.4 },
    { top: "5%", left: "40%", delay: 2.7 },
    { top: "85%", left: "65%", delay: 3.0 },
    { top: "30%", left: "25%", delay: 3.3 },
    { top: "60%", left: "70%", delay: 3.6 },
    { top: "20%", left: "58%", delay: 3.9 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {bursts.map((b, i) => (
        <Burst
          key={i}
          top={b.top}
          left={b.left}
          delay={b.delay}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  );
}
