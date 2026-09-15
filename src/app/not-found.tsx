export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FBF8EF] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob-1 absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#E7F5EC] opacity-60 blur-3xl" />
        <div className="blob-2 absolute top-96 -left-24 w-80 h-80 rounded-full bg-[#FFF3D6] opacity-50 blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center">
        <div className="float-hero text-7xl mb-4 inline-block">🎫</div>

        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#E0A72E] uppercase mb-2">
          404 — Not Found
        </p>
        <h1 className="[font-family:var(--font-fraunces)] text-3xl sm:text-4xl font-bold text-[#0F5132] mb-3 leading-tight">
          This page didn't win a number
        </h1>
        <p className="text-[#6B8A78] text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist, or the link might be
          outdated. Let's get you back to picking your lucky number.
        </p>

        <a
          href="/"
          className="press-scale inline-block rounded-xl bg-[#0F5132] text-white font-semibold px-8 py-3.5 hover:bg-[#0C4028] hover:shadow-lg hover:shadow-[#0F5132]/20 transition-all"
        >
          🏠 Back to Home
        </a>
      </div>
    </main>
  );
}
