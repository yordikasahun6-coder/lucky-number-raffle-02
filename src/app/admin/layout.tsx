"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/admin", label: "Review Desk", icon: "📇" },
  { href: "/admin", label: "Pending Claims", icon: "●", isDot: true },
  { href: "/admin/ledger", label: "Customer Ledger", icon: "📒" },
  { href: "/admin/records", label: "Claimed Tickets", icon: "🎟️" },
  { href: "/admin/screenshots", label: "Screenshots", icon: "🖼️" },
  { href: "/admin/accounts", label: "Payment Methods", icon: "💳" },
  { href: "/admin/prizes", label: "Prizes", icon: "🏆" },
  { href: "/admin/assets", label: "Site Images", icon: "🌄" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/reset", label: "Reset", icon: "🔄" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0B111C] flex">
      <aside className="w-64 shrink-0 bg-[#0A1020] border-r border-[#1C293C] flex flex-col">
        <div className="px-6 py-7 bg-gradient-to-br from-[#29164F] to-[#6D35D8]/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎫</span>
            <div>
              <p className="[font-family:var(--font-fraunces)] font-bold text-white text-sm leading-tight tracking-wide">
                LUCKY TICKET
              </p>
              <p className="[font-family:var(--font-mono)] text-[10px] text-[#D9A63A] tracking-widest">
                ADMIN PANEL
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link
                key={`${item.href}-${i}`}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gradient-to-r from-[#6D35D8] to-[#6D35D8]/60 text-white"
                    : "text-[#9AA7BC] hover:bg-[#131C2B] hover:text-[#F5F7FA]"
                }`}
              >
                {item.isDot ? (
                  <span
                    className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-[#9B5CFF]"}`}
                  />
                ) : (
                  <span className="text-base w-5 text-center">{item.icon}</span>
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-[#1C293C] pt-4 mt-2">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9B5CFF] to-[#6D35D8] flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-[#F5F7FA] text-sm font-medium">Admin User</p>
              <p className="text-[#64748B] text-xs">Super Administrator</p>
            </div>
          </div>
          <div className="px-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {children}
        <footer className="text-center py-6 text-[#64748B] text-xs">
          © 2025 Lucky Ticket. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
