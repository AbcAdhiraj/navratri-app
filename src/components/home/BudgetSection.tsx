import Link from "next/link";
import type { Section } from "@/lib/discovery";
import { EventRow } from "../events/cards";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "./SectionHeader";

/** Haldi block pairing "Under ₹500" and "Free entry" as scannable lists. */
export function BudgetSection({ under, free }: { under?: Section; free?: Section }) {
  const cols = [under, free].filter((x): x is Section => !!x);
  if (!cols.length) return null;
  return (
    <section aria-labelledby="budget-title" className="relative bg-haldi py-24 md:py-32">
      <div aria-hidden="true" className="bandhani absolute inset-0" style={{ "--dot": "rgb(30 23 19 / 0.12)", "--gap": "18px" } as React.CSSProperties} />
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <SectionHeader
          id="budget-title"
          kicker="Easy on the wallet"
          title="Great nights"
          accent="don’t need big tickets."
          accentClass="text-sindoor-deep"
          blurb="Only confirmed prices appear here. If an organizer hasn’t published a price, it shows as unknown — never as free."
          className="[&_.kicker]:!text-ink"
        />
        <div className={`grid gap-8 ${cols.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {cols.map((c) => (
            <div key={c.id} data-reveal className="rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card p-3 shadow-[var(--shadow-print)] md:p-4">
              <div className="flex items-center justify-between px-3 pb-3 pt-3 md:px-4">
                <h3 className="flex items-center gap-3">
                  <span className="font-display text-3xl font-bold tracking-tight md:text-4xl">{c.kicker}</span>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold tabular text-cream">{c.events.length}</span>
                </h3>
                <Link href={c.href} className="icon-btn border-[1.5px] border-ink/20 text-sindoor hover:border-ink" aria-label={`See all: ${c.kicker}`}>
                  <Icon name="arrowRight" />
                </Link>
              </div>
              <ul className="divide-y-[1.5px] divide-dashed divide-ink/10">
                {c.events.slice(0, 5).map((e) => (
                  <li key={e.slug}>
                    <EventRow event={e} className="md:!grid-cols-[4rem_1fr_8rem_2rem] [&>p:nth-of-type(2)]:md:hidden" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
