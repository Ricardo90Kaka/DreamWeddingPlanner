"use client";

import { Contact, Euro, House, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/budget", label: "Budget", icon: Euro },
  { href: "/gasten", label: "Gasten", icon: Contact },
  { href: "/todo", label: "To-do", icon: ListTodo },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-[1.9rem] border border-white/55 bg-[rgba(255,250,245,0.92)] px-2 py-2 shadow-[0_20px_45px_rgba(95,57,44,0.16)] backdrop-blur-xl">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-[1.4rem] px-2 py-2 transition ${
                active ? "bg-[rgba(143,90,73,0.12)]" : "hover:bg-white/70"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                }`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
