import Link from "next/link";
import { Rangoli } from "../art/Rangoli";
import { Diya, StickDivider } from "../art/Motifs";
import { LogoMark } from "./Logo";

const COLS = [
  {
    title: "Explore",
    links: [
      { href: "/events", label: "All events" },
      { href: "/events?price=free", label: "Free entry" },
      { href: "/#localities", label: "Localities" },
      { href: "/saved", label: "Saved" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { href: "/submit", label: "Submit an event" },
      { href: "/submit?kind=correction", label: "Corrections" },
      { href: "/methodology", label: "Source methodology" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-neel pb-28 pt-20 md:pb-12">
      <div aria-hidden="true" className="bandhani-ring absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[42%] left-1/2 w-[64rem] max-w-none -translate-x-1/2 opacity-25">
        <div className="motion-safe:animate-spin-slower">
          <Rangoli seed={2026} size={400} rings={7} strokeOnly colors={["#f3b61f", "#f4ecdd"]} strokeWidth={0.8} />
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <Diya className="size-14" />
          <p className="t-serif mt-3 text-3xl text-cream md:text-4xl">Nine nights. Make them count.</p>
        </div>
        <StickDivider className="my-12 text-haldi" />
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-9" />
              <span className="font-display text-xl font-extrabold">
                Navratri<span className="text-haldi">·</span>NCR
              </span>
            </div>
            <p className="t-meta mt-4 max-w-xs text-cream-dim">
              An independent guide to Navratri nights across Delhi, Dwarka, Noida, Gurugram and Ghaziabad. We link to organizers and ticketing platforms — we never sell tickets.
            </p>
          </div>
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="t-label text-haldi">{c.title}</h2>
              <ul className="mt-4 grid gap-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm font-medium text-cream-dim underline-offset-4 transition-colors hover:text-cream hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="t-meta mt-14 text-cream-dim">© {new Date().getFullYear()} Navratri NCR · Information may change — always confirm with the organizer before you go.</p>
      </div>
    </footer>
  );
}
