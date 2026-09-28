"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/history", label: "History" },
];

export function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cx("flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-colors", active ? "bg-ink text-cream" : "text-ink-soft hover:bg-paper-2 hover:text-ink")}
          >
            {l.label}
            {l.href === "/admin/submissions" && pending > 0 && <span className="rounded-full bg-sindoor px-1.5 text-[0.65rem] leading-4 text-cream">{pending}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
