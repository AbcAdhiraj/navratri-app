import { AREA_META } from "@/lib/constants";
import { cx, formatDateRange, formatTimeRange, priceLabel } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { EventTitle } from "../events/bits";

/** The "ticket" that overlaps the hero: name, date · time, venue, price. */
export function TicketPanel({ event: e, className }: { event: EventRecord; className?: string }) {
  const first = e.occurrences[0];
  return (
    <div className={cx("relative rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card p-6 shadow-[var(--shadow-print-lg)] md:p-9", className)}>
      <h1 className="t-h1 animate-rise text-balance !text-[clamp(2.2rem,5vw,4.25rem)]">
        <EventTitle event={e} />
      </h1>
      {e.tagline && <p className="t-serif mt-3 max-w-2xl animate-rise text-xl text-ink-soft [animation-delay:.08s] md:text-2xl">{e.tagline}</p>}
      <dl className="mt-7 grid animate-rise gap-5 border-t-2 border-dashed border-ink/20 pt-6 [animation-delay:.16s] sm:grid-cols-3 sm:gap-0 sm:divide-x-[1.5px] sm:divide-dashed sm:divide-ink/15">
        <div className="sm:pr-6">
          <dt className="t-label text-sindoor">Date · Time</dt>
          <dd className="mt-2 font-bold">{formatDateRange(e.occurrences)}</dd>
          <dd className="t-meta text-ink-soft">{first ? formatTimeRange(first) : "Time not confirmed"}</dd>
        </div>
        <div className="sm:px-6">
          <dt className="t-label text-sindoor">Venue</dt>
          <dd className="mt-2 font-bold">{e.venue.name}</dd>
          <dd className="t-meta text-ink-soft">
            {e.venue.locality}, {AREA_META[e.venue.area].label}
          </dd>
        </div>
        <div className="sm:pl-6">
          <dt className="t-label text-sindoor">Price</dt>
          <dd className={cx("mt-1.5 font-display text-2xl font-bold", e.price.status === "unknown" && "!text-lg text-ink-faint")}>{priceLabel(e.price)}</dd>
          {e.price.note && <dd className="t-meta text-ink-soft">{e.price.note}</dd>}
        </div>
      </dl>
    </div>
  );
}
