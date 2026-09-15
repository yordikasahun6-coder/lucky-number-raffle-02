"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#FBF8EF] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob-1 absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FDF2F0] opacity-70 blur-3xl" />
        <div className="blob-2 absolute top-96 -left-24 w-80 h-80 rounded-full bg-[#FFF3D6] opacity-50 blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🍀</div>

        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#E15B4F] uppercase mb-2">
          Something went wrong
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#0F5132] mb-3 leading-tight">
          That wasn't supposed to happen
        </h1>
        <p className="text-[#6B8A78] text-sm mb-8 max-w-sm mx-auto">
          Something unexpected went wrong on our end. Your ticket and payment
          information are safe — try again, or head back to the homepage.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="press-scale rounded-xl bg-[#0F5132] text-white font-semibold px-6 py-3 hover:bg-[#0C4028] transition-colors"
          >
            🔄 Try Again
          </button>
          <a
            href="/"
            className="press-scale rounded-xl border-2 border-[#0F5132] text-[#0F5132] font-semibold px-6 py-3 hover:bg-[#0F5132] hover:text-white transition-colors"
          >
            🏠 Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
