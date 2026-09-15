export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-[#0B111C] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎫</div>
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#D9A63A] uppercase mb-2">
          404 — Not Found
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-3">
          This admin page doesn't exist
        </h1>
        <p className="text-[#9AA7BC] text-sm mb-8">
          Check the sidebar for the page you're looking for.
        </p>
        <a
          href="/admin"
          className="inline-block rounded-xl bg-gradient-to-r from-[#6D35D8] to-[#8B4DFF] text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
        >
          ← Back to Review Desk
        </a>
      </div>
    </div>
  );
}
