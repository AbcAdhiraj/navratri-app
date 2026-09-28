"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/format";
import { useSaved } from "@/lib/saved";
import { useSearch } from "../search/SearchProvider";
import { Icon, type IconName } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";

const MORE = [
  { href: "/saved", label: "Saved events", icon: "bookmark" as IconName },
  { href: "/submit", label: "Suggest an event", icon: "plus" as IconName },
  { href: "/submit?kind=correction", label: "Report a correction", icon: "edit" as IconName },
  { href: "/methodology", label: "How we verify", icon: "shield" as IconName },
  { href: "/privacy", label: "Privacy", icon: "info" as IconName },
  { href: "/terms", label: "Terms", icon: "info" as IconName },
];

export function MobileNav() {
  const pathname = usePathname();
  const { open } = useSearch();
  const [more, setMore] = useState(false);
  const saved = useSaved().length;

  // Event pages use the sticky booking bar instead; admin has its own chrome.
  if (/^\/events\/[^/]+/.test(pathname) || pathname.startsWith("/admin")) return null;

  const item = "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[0.68rem] font-bold tracking-wide transition-colors";
  return (
    <>
      <nav aria-label="Mobile" className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div
          className="flex items-stretch gap-1 rounded-[1.4rem] border-[1.5px] border-ink bg-card p-1 shadow-[var(--shadow-print-sm)]"
          style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom) - 12px)" }}
        >
          <Link href="/" className={cx(item, pathname === "/" ? "bg-ink text-haldi" : "text-ink-soft")} aria-current={pathname === "/" ? "page" : undefined}>
            <Icon name="compass" size={21} />
            Explore
          </Link>
          <Link href="/events" className={cx(item, pathname === "/events" ? "bg-ink text-haldi" : "text-ink-soft")} aria-current={pathname === "/events" ? "page" : undefined}>
            <Icon name="grid" size={21} />
            Events
          </Link>
          <button type="button" onClick={open} className={cx(item, "text-ink-soft")}>
            <Icon name="search" size={21} />
            Search
          </button>
          <button type="button" onClick={() => setMore(true)} className={cx(item, "relative text-ink-soft")} aria-haspopup="dialog">
            <Icon name="menu" size={21} />
            More
            {saved > 0 && <span className="absolute right-[30%] top-1.5 size-2 rounded-full bg-sindoor" aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <Sheet open={more} onClose={() => setMore(false)} title="More">
        <ul className="grid gap-1 pb-4">
          {MORE.map((m) => (
            <li key={m.href}>
              <Link href={m.href} onClick={() => setMore(false)} className="flex items-center gap-4 rounded-2xl px-3 py-3.5 font-bold hover:bg-paper-2">
                <span className="grid size-10 place-items-center rounded-xl border-[1.5px] border-ink/15 bg-card text-sindoor">
                  <Icon name={m.icon} />
                </span>
                {m.label}
                {m.href === "/saved" && saved > 0 && <span className="ml-auto rounded-full bg-sindoor px-2 py-0.5 text-xs font-bold text-cream">{saved}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
