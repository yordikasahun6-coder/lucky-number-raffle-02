"use client";

type Prize = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  image_url: string | null;
};

export default function PrizeShowcase({ prizes }: { prizes: Prize[] }) {
  if (prizes.length === 0) return null;

  return (
    <div className="ticket-stub hover-lift px-6 py-6">
      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
        🏆 Prizes
      </p>
      <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-5">
        What you could win
      </h2>

      <div
        className={`grid gap-3 ${prizes.length === 1 ? "" : prizes.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
      >
        {prizes.map((p, i) => (
          <div
            key={p.id}
            className="hover-lift rounded-xl border border-[#EAE1C4] bg-[#FFFEFA] p-4 text-center"
          >
            {i === 0 && prizes.length > 1 && (
              <span className="inline-block mb-2 text-[10px] font-bold text-[#E0A72E] bg-[#FFF8E6] rounded-full px-2 py-0.5">
                TOP PRIZE
              </span>
            )}
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.title}
                className="w-16 h-16 object-cover rounded-full mx-auto mb-3 border-2 border-[#EAE1C4]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#E7F5EC] flex items-center justify-center text-2xl mx-auto mb-3">
                🏆
              </div>
            )}
            <p className="font-bold text-[#14231C] text-sm">{p.title}</p>
            <p className="[font-family:var(--font-fraunces)] text-lg font-bold text-[#E0A72E] mt-1">
              {p.amount}
            </p>
            {p.description && (
              <p className="text-[#8A9A8F] text-xs mt-1">{p.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
