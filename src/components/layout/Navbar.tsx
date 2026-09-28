"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";
import { useSaved } from "@/lib/saved";
import { useSearch } from "../search/SearchProvider";
import { Icon } from "../ui/Icon";
import { DemoRibbon } from "./DemoRibbon";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Explore" },
  { href: "/events", label: "All events" },
  { href: "/#localities", label: "Localities" },
  { href: "/submit", label: "Submit an event" },
];

export function Navbar({ demo = false }: { demo?: boolean }) {
  const pathname = usePathname();
  const { open } = useSearch();
  const saved = useSaved().length;
  return (
    <header className="nav-shell fixed inset-x-0 top-0 z-50 border-b-[1.5px] border-ink/10 bg-paper/95 backdrop-blur-md transition-[border-color] duration-300">
      {demo && <DemoRibbon />}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-8 lg:px-12">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : !l.href.startsWith("/#") && pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "relative rounded-full px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink",
                    active && "text-ink after:absolute after:bottom-0 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-sindoor",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={open}
            className="flex h-10 items-center gap-2 rounded-full border-[1.5px] border-ink/20 bg-card pl-3 pr-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink max-md:w-10 max-md:justify-center max-md:px-0 md:w-60"
            aria-label="Search events, venues and localities"
          >
            <Icon name="search" size={17} />
            <span className="hidden flex-1 truncate whitespace-nowrap text-left md:inline">Search events, venues…</span>
            <kbd className="hidden rounded-md border border-ink/20 px-1.5 py-0.5 font-sans text-[0.65rem] md:inline">⌘K</kbd>
          </button>
          <Link href="/saved" className="icon-btn relative hidden md:inline-grid" aria-label={`Saved events (${saved})`}>
            <Icon name="bookmark" />
            {saved > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-sindoor text-[0.65rem] font-bold text-cream">{saved}</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
