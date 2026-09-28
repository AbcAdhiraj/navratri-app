import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Source methodology",
  description: "How Navratri NCR checks dates, prices, entry rules and booking links — and what “Not confirmed” means.",
  alternates: { canonical: "/methodology" },
};

const RULES: { icon: IconName; title: string; body: string }[] = [
  { icon: "link", title: "Primary sources first", body: "Organizer pages, official social posts, ticketing platforms and printed notices. Aggregators are leads, never proof." },
  { icon: "rupee", title: "No invented facts", body: "Unknown prices show as “Price unknown”, never ₹0. Missing entry rules show as “Not confirmed”." },
  { icon: "ticket", title: "Verified booking only", body: "A Book button appears only after we confirm the link belongs to the organizer or their ticketing partner." },
  { icon: "clock", title: "Freshness on every page", body: "Each listing shows when it was last checked. Stale details get re-checked or taken down." },
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader kicker="Trust" title="How we verify" accent="every listing." lead="Navratri NCR is a guide, not a ticket seller. Our job is to be right — and to be clear when we don’t know." tone="ink" />
      <div className="mx-auto grid max-w-[90rem] gap-4 px-4 pt-12 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-12">
        {RULES.map((r) => (
          <div key={r.title} className="rounded-[var(--radius-card)] border-[1.5px] border-ink bg-card p-6 shadow-[var(--shadow-print-sm)]">
            <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-ink bg-haldi">
              <Icon name={r.icon} size={18} />
            </span>
            <h2 className="t-h3 mt-5">{r.title}</h2>
            <p className="t-meta mt-2 text-ink-soft">{r.body}</p>
          </div>
        ))}
      </div>
      <Prose>
        <h2>What each check means</h2>
        <ul>
          <li>
            <b>Date checked</b> — the nights and times match a primary source published by the organizer or venue.
          </li>
          <li>
            <b>Price checked</b> — the lowest ticket price (or free entry) is stated by the organizer or the ticketing page.
          </li>
          <li>
            <b>Entry policy checked</b> — stag, couple, group, age and dress-code rules come from the organizer, not from reviews or hearsay.
          </li>
          <li>
            <b>Booking link checked</b> — the link resolves to the organizer or their named ticketing partner.
          </li>
        </ul>
        <h2>Vibe labels</h2>
        <p>Labels like “Traditional Garba”, “Bollywood Mix” or “Late Night” only appear with a cited basis — usually the organizer’s own description or published timings. Each label on an event page shows its evidence and source.</p>
        <h2>Crowd impressions</h2>
        <p>
          Some events show an optional, crowd-reported impression (for example “roughly 50–60% women”). It is an aggregate of reports from people who attended that event or a clearly named previous edition, shown only once at least three reports exist. It is a perception, not a measurement. We never infer gender or any demographic from photos or appearance.
        </p>
        <h2>Photos</h2>
        <p>We only show photographs we have permission to use, with credit and year. Everything else uses original artwork — never random stock images presented as the event.</p>
        <h2>Ratings</h2>
        <p>We don’t publish star ratings or overall scores. Without genuine, verifiable review data, a number would only look authoritative.</p>
        <h2>Corrections</h2>
        <p>
          Anyone can <Link href="/submit?kind=correction">suggest a correction</Link>. Every change goes through a moderator, who checks the evidence and records the decision and the before/after revision.
        </p>
      </Prose>
    </>
  );
}
