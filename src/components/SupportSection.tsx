"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Member = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  response_time: string;
  telegram_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  email: string | null;
};

function TeamMemberCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  const channels = [
    member.telegram_url && {
      key: "telegram",
      icon: "✈️",
      label: "Telegram",
      href: member.telegram_url,
    },
    member.instagram_url && {
      key: "instagram",
      icon: "📷",
      label: "Instagram",
      href: member.instagram_url,
    },
    member.whatsapp_url && {
      key: "whatsapp",
      icon: "💬",
      label: "WhatsApp",
      href: member.whatsapp_url,
    },
    member.email && {
      key: "email",
      icon: "✉️",
      label: "Email",
      href: `mailto:${member.email}`,
    },
  ].filter(Boolean) as {
    key: string;
    icon: string;
    label: string;
    href: string;
  }[];

  return (
    <div className="rounded-2xl border border-[#EAE1C4] bg-[#FFFEFA] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-[#EAE1C4]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#E7F5EC] flex items-center justify-center text-2xl shrink-0">
              🎧
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[#14231C] font-bold">{member.name}</p>
              <span className="rounded-full bg-[#E7F5EC] text-[#0F5132] text-[10px] font-semibold px-2 py-0.5">
                Available 24/7
              </span>
            </div>
            {member.description && (
              <p className="text-[#6B8A78] text-xs mt-1 leading-relaxed">
                {member.description}
              </p>
            )}
            <p className="text-[#8A9A8F] text-[11px] mt-1 flex items-center gap-1">
              🕐 Typically replies within {member.response_time}
            </p>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className={`text-[#E0A72E] text-sm shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            ▾
          </button>
        </div>

        {channels.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {channels.map((c) => (
              <a
                key={c.key}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="press-scale flex flex-col items-center justify-center gap-1 rounded-xl border border-[#EAE1C4] py-2.5 hover:border-[#0F5132] hover:bg-[#E7F5EC] transition-colors"
              >
                <span className="text-lg">{c.icon}</span>
                <span className="text-[#14231C] text-[11px] font-medium">
                  {c.label}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={`expand-panel ${open ? "open" : ""}`}>
        <div>
          <div className="ticket-divider mx-4" />
          <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E7F5EC] flex items-center justify-center shrink-0">
                🕐
              </span>
              <div>
                <p className="text-[#8A9A8F]">Available</p>
                <p className="text-[#14231C] font-semibold">24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E7F5EC] flex items-center justify-center shrink-0">
                ⏱
              </span>
              <div>
                <p className="text-[#8A9A8F]">Response time</p>
                <p className="text-[#14231C] font-semibold">
                  {member.response_time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E7F5EC] flex items-center justify-center shrink-0">
                🌐
              </span>
              <div>
                <p className="text-[#8A9A8F]">Languages</p>
                <p className="text-[#14231C] font-semibold">
                  English, Amharic, Afaan Oromo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E7F5EC] flex items-center justify-center shrink-0">
                ⭐
              </span>
              <div>
                <p className="text-[#8A9A8F]">Satisfaction</p>
                <p className="text-[#14231C] font-semibold">4.9 / 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportSection({ members }: { members: Member[] }) {
  const { t } = useLanguage();

  if (members.length === 0) return null;

  return (
    <div className="ticket-stub hover-lift px-6 py-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
            {t("supportLabel") || "Need help?"}
          </p>
          <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C]">
            {t("supportTitle") || "Talk to our support team"}
          </h2>
          <p className="text-[#8A9A8F] text-xs mt-1">
            {t("supportSubtitle") ||
              "We're here to help you 24/7. Choose a support member to get in touch."}
          </p>
        </div>
        <div className="rounded-xl bg-[#E7F5EC] border border-[#CFE9D8] px-4 py-2.5 flex items-center gap-2.5 shrink-0">
          <span className="text-[#0F5132]">🛡️</span>
          <div>
            <p className="text-[#0F5132] text-xs font-bold">Trusted Support</p>
            <p className="text-[#6B8A78] text-[10px]">
              Conversations are safe & private
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <TeamMemberCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}
