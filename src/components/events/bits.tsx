import { EVENT_TYPE_META, VIBE_META } from "@/lib/constants";
import { firstDate } from "@/lib/discovery";
import { cx, parseDay, priceLabel } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

/** Renders the title with a visible DEMO badge for fixtures (the "DEMO —" prefix becomes a badge). */
export function EventTitle({ event, className }: { event: Pick<EventRecord, "title" | "isDemo">; className?: string }) {
  const m = event.isDemo ? event.title.match(/^DEMO\s*[—–-]\s*(.*)$/) : null;
  if (!m) return <span className={className}>{event.title}</span>;
  return (
    <span className={className}>
      <DemoBadge className="mr-2 align-[0.22em]" />
      <span className="sr-only">Demo event: </span>
      {m[1]}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-[0.3rem] border-[1.5px] border-dashed border-ink bg-haldi px-1.5 py-[0.2rem] font-sans text-[0.58rem] font-extrabold leading-none tracking-[0.18em] text-ink",
        className,
      )}
      title="Fictional development fixture — not a real event"
      aria-hidden="true"
    >
      DEMO
    </span>
  );
}

/** Calendar-leaf date tile. */
export function DateBadge({ date, className }: { date: string; className?: string }) {
  const d = parseDay(date);
  return (
    <div className={cx("flex w-14 flex-col items-center overflow-hidden rounded-xl border-[1.5px] border-ink bg-card leading-none text-ink", className)}>
      <span className="w-full bg-sindoor py-1 text-center text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-cream">{d.month}</span>
      <span className="pt-1.5 font-display text-2xl font-bold tabular">{d.d}</span>
      <span className="pb-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-ink-soft">{d.weekday}</span>
    </div>
  );
}

export function PriceTag({ event, className }: { event: Pick<EventRecord, "price">; className?: string }) {
  const p = event.price;
  return (
    <span
      className={cx(
        "tag",
        p.status === "free" && "bg-mehendi text-cream",
        p.status === "paid" && "bg-ink text-cream",
        p.status === "unknown" && "border-[1.5px] border-dashed border-ink/40 bg-card text-ink-soft",
        className,
      )}
    >
      {p.status === "unknown" ? "Price unknown" : priceLabel(p)}
    </span>
  );
}

export function TypeTags({ event, max = 2, tone = "paper" }: { event: Pick<EventRecord, "types">; max?: number; tone?: "paper" | "onMedia" | "dark" }) {
  return (
    <>
      {event.types.slice(0, max).map((t) => (
        <span
          key={t}
          className={cx(
            "tag",
            tone === "paper" && "bg-ink/[0.07] text-ink",
            tone === "onMedia" && "bg-card text-ink",
            tone === "dark" && "bg-cream/15 text-cream",
          )}
        >
          {EVENT_TYPE_META[t].label}
        </span>
      ))}
    </>
  );
}

export function VibeTags({ event, max = 3 }: { event: Pick<EventRecord, "vibes">; max?: number }) {
  return (
    <>
      {event.vibes.slice(0, max).map((v) => (
        <span key={v.tag} className="tag border-[1.5px] border-sindoor/30 text-sindoor">
          {VIBE_META[v.tag].label}
        </span>
      ))}
    </>
  );
}

/** "17 Oct" + "+3 more nights" hint relative to a focus date. */
export function nightsHint(e: EventRecord, focus?: string | null) {
  const d = firstDate(e, focus);
  const more = e.occurrences.length - 1;
  return { date: d, more: more > 0 ? `+${more} more night${more > 1 ? "s" : ""}` : null };
}
