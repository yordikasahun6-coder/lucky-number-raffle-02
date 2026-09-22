import TelegramLinkCard from "@/components/TelegramLinkCard";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-6">
        <p className="[font-family:var(--font-mono)] text-xs tracking-widest text-[#8B4DFF] uppercase mb-1">
          Personal
        </p>
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-1">
          My Telegram notifications
        </h1>
        <p className="text-[#9AA7BC] text-sm">
          Connect your own Telegram to get pinged the moment a new payment comes
          in.
        </p>
        <div className="w-10 h-1 rounded-full bg-[#6D35D8] mt-3" />
      </div>
      <div className="max-w-md">
        <TelegramLinkCard />
      </div>
    </main>
  );
}
