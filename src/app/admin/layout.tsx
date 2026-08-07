import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/admin", label: "Pending claims" },
    { href: "/admin/records", label: "Claimed tickets" },
    { href: "/admin/screenshots", label: "Screenshots" },
    { href: "/admin/accounts", label: "Payment methods" },
    { href: "/admin/prizes", label: "Prizes" },
    { href: "/admin/assets", label: "Site images" },
    { href: "/admin/settings", label: "Ticket price" },
    { href: "/admin/reset", label: "Reset" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <div className="border-b border-[#232D42]">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3.5 py-2 text-sm text-[#7C879C] hover:text-[#EDEFF3] hover:bg-[#141B29] transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
