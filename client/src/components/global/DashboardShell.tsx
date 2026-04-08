"use client";

import { LogOut, LayoutDashboard, ReceiptText, FileBarChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/session";
import { useMemo } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useMemo(() => getSessionUser(), []);

  return (
    <main className="min-h-screen bg-[#f7f7f7] p-3 md:p-6">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-330 overflow-hidden rounded-md border border-borderGray bg-white md:min-h-[calc(100vh-3rem)]">
        <header className="relative flex h-21.5 items-center justify-between overflow-hidden px-4 text-white md:px-7">
          <Image src="/images/bg.png" alt="Header background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[#1d2a10]/65" />

          <h1 className="relative text-3xl font-semibold">Agro dealer Portal</h1>

          <div className="relative flex items-center gap-3 text-sm font-semibold md:text-xl">
            <span>Logged In As:</span>
            <span>{user?.username?.toUpperCase() || "USER"}</span>
            <button
              type="button"
              onClick={() => {
                clearSession();
                router.push("/auth/login");
              }}
              className="ml-2 flex items-center gap-2 rounded-md border border-white/70 px-4 py-2 text-[15px]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-86px-1.5rem)] grid-cols-1 md:grid-cols-[260px_1fr] md:min-h-[calc(100vh-86px-3rem)]">
          <aside className="border-r border-borderGray bg-[#fcfcfc] pt-5">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-7 py-4 text-[34px] font-medium transition ${
                      isActive
                        ? "border-l-4 border-primaryYellow bg-white text-textBlack"
                        : "text-textGray hover:bg-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="p-6 md:p-9">{children}</section>
        </div>
      </div>
    </main>
  );
}
