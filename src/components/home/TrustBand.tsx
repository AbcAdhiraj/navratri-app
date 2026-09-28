import Link from "next/link";
import { StickDivider } from "../art/Motifs";
import { Icon, type IconName } from "../ui/Icon";

const POINTS: { icon: IconName; title: string; body: string }[] = [
  { icon: "link", title: "Every fact has a source", body: "Dates, prices and entry rules link back to the organizer or ticketing page they came from." },
  { icon: "rupee", title: "Unknown stays unknown", body: "No guessed prices, no invented rules. If it isn’t confirmed, we say “Not confirmed”." },
  { icon: "clock", title: "Freshness on display", body: "Each listing shows when it was last checked, and corrections go through moderation." },
];

export function TrustBand({ lastChecked }: { lastChecked: string | null }) {
  return (
    <section aria-labelledby="trust-title" className="on-dark relative overflow-hidden bg-ink py-24 md:py-28">
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="kicker justify-center">Why trust this</p>
          <h2 id="trust-title" className="t-h2 mt-4">
            Checked at the source, <span className="t-serif text-haldi">not scraped and guessed.</span>
          </h2>
        </div>
        <StickDivider className="mx-auto my-12 max-w-md text-haldi" />
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {POINTS.map((p, i) => (
            <li key={p.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="rounded-[var(--radius-card)] border-[1.5px] border-cream/15 p-6 md:p-7">
              <span className="grid size-11 place-items-center rounded-full bg-mehendi text-cream">
                <Icon name={p.icon} size={19} />
              </span>
              <h3 className="t-h3 mt-5">{p.title}</h3>
              <p className="t-body mt-2 text-cream-dim">{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          {lastChecked && <p className="t-meta text-cream-faint">Most recent check: {lastChecked}</p>}
          <Link href="/methodology" className="btn btn-outline btn-sm">
            Read our source methodology <Icon name="arrowRight" size={16} className="btn-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
