export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-6">
          <svg
            viewBox="0 0 100 100"
            className="loading-ring absolute inset-0 w-full h-full"
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#EAE1C4"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#0F5132"
              strokeWidth="4"
              strokeDasharray="60 200"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
            <div className="loading-ball-1 w-4 h-4 rounded-full bg-[#0F5132]" />
            <div className="loading-ball-2 w-4 h-4 rounded-full bg-[#E0A72E]" />
            <div className="loading-ball-3 w-4 h-4 rounded-full bg-[#4FBF8B]" />
          </div>
        </div>
        <p className="loading-text text-[#8A9A8F] text-sm">
          Loading your numbers...
        </p>
      </div>
    </main>
  );
}
