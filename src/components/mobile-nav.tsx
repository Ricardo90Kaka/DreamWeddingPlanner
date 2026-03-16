"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", shortLabel: "DB" },
  { href: "/budget", label: "Budget", shortLabel: "BG" },
  { href: "/gasten", label: "Gasten", shortLabel: "GS" },
  { href: "/todo", label: "To-do", shortLabel: "TD" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-[1.9rem] border border-white/55 bg-[rgba(255,250,245,0.92)] px-2 py-2 shadow-[0_20px_45px_rgba(95,57,44,0.16)] backdrop-blur-xl">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-[1.4rem] px-3 py-3 transition ${
                active ? "bg-[rgba(143,90,73,0.12)]" : "hover:bg-white/70"
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tracking-[0.16em] ${
                  active
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                }`}
              >
                {item.shortLabel}
              </span>
              <span className="min-w-0 truncate text-sm font-semibold text-[var(--foreground)]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
