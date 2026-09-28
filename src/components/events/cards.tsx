import Link from "next/link";
import { EventMedia } from "../art/EventMedia";
import { Icon } from "../ui/Icon";
import { AREA_META, VIBE_META } from "@/lib/constants";
import { cx, formatDay, formatTimeRange, inr, parseDay, priceLabel } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { BookmarkButton } from "./actions";
import { DateBadge, EventTitle, PriceTag, TypeTags, VibeTags, nightsHint } from "./bits";

interface CardProps {
  event: EventRecord;
  /** The night the user is browsing; dates/times are shown relative to it. */
  focusDate?: string | null;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const href = (e: EventRecord) => `/events/${e.slug}`;

function occurrenceFor(e: EventRecord, date: string) {
  return e.occurrences.find((o) => o.date === date) ?? e.occurrences[0];
}

/** Stretched link: the whole card is clickable while inner buttons stay independent. */
function CardLink({ e, children, className }: { e: EventRecord; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href(e)} className={cx("after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none", className)}>
      {children}
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────
   1. FEATURED — large poster with a perforated ticket stub
   ──────────────────────────────────────────────────────────── */
export function FeaturedEventCard({ event: e, focusDate, priority, className, style }: CardProps) {
  const { date, more } = nightsHint(e, focusDate);
  const occ = occurrenceFor(e, date);
  return (
    <article
      style={style}
      className={cx(
        "lift group relative isolate flex min-h-[27rem] flex-col overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card text-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-sindoor md:min-h-[31rem]",
        className,
      )}
    >
      <div className="relative min-h-[14rem] flex-1 overflow-hidden">
        <EventMedia event={e} priority={priority} sizes="(min-width: 1024px) 60vw, 95vw" />
        {e.media.length > 0 && <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />}
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between md:left-5 md:right-5 md:top-5">
          <DateBadge date={date} />
          <BookmarkButton slug={e.slug} title={e.title} />
        </div>
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 md:left-5">
          <PriceTag event={e} />
          <TypeTags event={e} tone="onMedia" />
        </div>
      </div>

      {/* ticket stub */}
      <div className="relative border-t-2 border-dashed border-ink/30 px-5 pb-5 pt-4 md:px-6 md:pb-6">
        <span aria-hidden="true" className="absolute -left-3 -top-3 size-6 rounded-full border-[1.5px] border-ink bg-[var(--notch,var(--color-paper))] [clip-path:inset(0_0_0_50%)]" />
        <span aria-hidden="true" className="absolute -right-3 -top-3 size-6 rounded-full border-[1.5px] border-ink bg-[var(--notch,var(--color-paper))] [clip-path:inset(0_50%_0_0)]" />
        <h3 className="t-h2 !text-[clamp(1.6rem,2.8vw,2.4rem)] text-balance">
          <CardLink e={e}>
            <EventTitle event={e} />
          </CardLink>
        </h3>
        {e.tagline && <p className="mt-2 line-clamp-2 max-w-[50ch] text-[0.95rem] leading-relaxed text-ink-soft">{e.tagline}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="t-meta flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pin" size={14} className="text-sindoor" />
              {e.venue.locality}, {AREA_META[e.venue.area].label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={14} className="text-sindoor" />
              {formatTimeRange(occ)}
            </span>
            {more && <span className="font-semibold text-ink">{more}</span>}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-sindoor">
            View event <Icon name="arrowRight" size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   2. STANDARD — compact, information-first
   ──────────────────────────────────────────────────────────── */
export function EventCard({ event: e, focusDate, className, style }: CardProps) {
  const { date, more } = nightsHint(e, focusDate);
  const occ = occurrenceFor(e, date);
  const d = parseDay(date);
  return (
    <article
      style={style}
      className={cx(
        "lift group relative isolate flex flex-col overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink/15 bg-card text-ink hover:border-ink focus-within:border-ink",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-[1.5px] border-ink/10">
        <EventMedia event={e} word={false} />
        <div className="absolute left-3 top-3 z-[2]">
          <PriceTag event={e} />
        </div>
        <BookmarkButton slug={e.slug} title={e.title} className="absolute right-3 top-3 !size-9" />
      </div>
      <div className="relative flex flex-1 flex-col p-4">
        <p className="t-label mb-2 flex items-center gap-2 text-sindoor">
          <span className="tabular">
            {d.weekday} {d.d} {d.month}
          </span>
          <span className="size-1 rounded-full bg-current opacity-50" />
          <span className="text-ink-faint">{occ.startTime ? formatTimeRange(occ).split(" – ")[0] : "Time TBC"}</span>
        </p>
        <h3 className="t-h3 text-pretty">
          <CardLink e={e}>
            <EventTitle event={e} />
          </CardLink>
        </h3>
        <p className="t-meta mt-1.5 text-ink-soft">
          {e.venue.locality} · {AREA_META[e.venue.area].label}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          <TypeTags event={e} max={2} />
          {more && <span className="text-[0.7rem] font-semibold text-ink-faint">{more}</span>}
        </div>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   3. HORIZONTAL — landscape card for mobile discovery lists
   ──────────────────────────────────────────────────────────── */
export function HorizontalEventCard({ event: e, focusDate, className }: CardProps) {
  const { date } = nightsHint(e, focusDate);
  const occ = occurrenceFor(e, date);
  return (
    <article
      className={cx(
        "group relative isolate flex h-36 overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink/15 bg-card text-ink transition-transform duration-300 active:scale-[0.98]",
        className,
      )}
    >
      <div className="relative w-[36%] shrink-0 overflow-hidden border-r-[1.5px] border-ink/10">
        <EventMedia event={e} word={false} sizes="160px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <p className="t-label mb-1.5 text-sindoor">{formatDay(date, { weekday: true })}</p>
        <h3 className="line-clamp-2 font-display text-[1.05rem] font-bold leading-tight tracking-tight">
          <CardLink e={e}>
            <EventTitle event={e} />
          </CardLink>
        </h3>
        <p className="t-meta mt-1 truncate text-ink-soft">
          {e.venue.locality} · {formatTimeRange(occ).split(" – ")[0]}
        </p>
        <p className="mt-auto text-sm font-extrabold">{e.price.status === "unknown" ? <span className="font-medium text-ink-faint">Price unknown</span> : priceLabel(e.price)}</p>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   4. ROW — compact result row
   ──────────────────────────────────────────────────────────── */
export function EventRow({ event: e, focusDate, className }: CardProps) {
  const { date, more } = nightsHint(e, focusDate);
  const occ = occurrenceFor(e, date);
  const d = parseDay(date);
  return (
    <article
      className={cx(
        "group relative grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-paper-2/60 md:grid-cols-[4rem_1fr_12rem_8rem_2rem] md:px-4",
        className,
      )}
    >
      <div className="flex flex-col items-center overflow-hidden rounded-xl border-[1.5px] border-ink bg-card leading-none">
        <span className="w-full bg-sindoor py-0.5 text-center text-[0.52rem] font-extrabold uppercase tracking-[0.14em] text-cream">{d.month}</span>
        <span className="pt-1 font-display text-xl font-bold tabular">{d.d}</span>
        <span className="pb-1 text-[0.52rem] font-extrabold uppercase tracking-wider text-ink-soft">{d.weekday}</span>
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight tracking-tight md:truncate">
          <CardLink e={e}>
            <EventTitle event={e} />
          </CardLink>
        </h3>
        <p className="t-meta mt-0.5 truncate text-ink-soft">
          <span className="hidden md:inline">{e.venue.name} · </span>
          {e.venue.locality}, {AREA_META[e.venue.area].label}
          <span className="md:hidden"> · {formatTimeRange(occ).split(" – ")[0]}</span>
        </p>
      </div>
      <p className="t-meta hidden text-ink-soft md:block">
        {formatTimeRange(occ)}
        {more && <span className="block text-xs text-ink-faint">{more}</span>}
      </p>
      <PriceStack event={e} />
      <Icon name="arrowRight" className="hidden text-sindoor transition-transform group-hover:translate-x-1 md:block" />
    </article>
  );
}

function PriceStack({ event: e }: { event: EventRecord }) {
  const p = e.price;
  if (p.status === "unknown") return <p className="text-right text-sm font-medium text-ink-faint">Price unknown</p>;
  if (p.status === "free" || p.minInr == null)
    return <p className={cx("text-right text-sm font-extrabold", p.status === "free" && "text-mehendi")}>{priceLabel(p)}</p>;
  return (
    <p className="text-right leading-tight">
      <span className="block text-sm font-extrabold tabular">{inr(p.minInr)}</span>
      <span className="block text-[0.7rem] text-ink-faint">onwards</span>
    </p>
  );
}

/* ────────────────────────────────────────────────────────────
   5. EDITORIAL — asymmetric spotlight: poster + overlapping printed panel
   ──────────────────────────────────────────────────────────── */
export function EditorialCard({ event: e, focusDate, className, index = 1, reverse = false }: CardProps & { index?: number; reverse?: boolean }) {
  const { date, more } = nightsHint(e, focusDate);
  const occ = occurrenceFor(e, date);
  return (
    <article className={cx("group relative isolate grid md:grid-cols-12 md:items-center", className)}>
      <div
        className={cx(
          "relative aspect-[4/5] overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink md:col-span-7 md:row-start-1 md:aspect-[5/4]",
          reverse ? "md:col-start-6" : "md:col-start-1",
        )}
      >
        <EventMedia event={e} sizes="(min-width: 768px) 55vw, 95vw" />
        <span
          className={cx("t-display absolute top-4 !text-[4.5rem] text-cream md:!text-[7rem]", reverse ? "left-5" : "right-5")}
          style={{ WebkitTextStroke: "1.5px var(--color-ink)" }}
          aria-hidden="true"
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <div
        className={cx(
          "relative z-10 mx-4 -mt-24 rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card p-6 shadow-[var(--shadow-print)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 md:col-span-6 md:row-start-1 md:mx-0 md:mt-0 md:p-9",
          reverse ? "md:col-start-1" : "md:col-start-7",
        )}
      >
        <p className="kicker mb-4 !text-sindoor">
          {formatDay(date, { weekday: true })}
          {more ? ` · ${more}` : ""}
        </p>
        <h3 className="t-h2 text-balance">
          <CardLink e={e}>
            <EventTitle event={e} />
          </CardLink>
        </h3>
        {e.tagline && <p className="t-serif mt-3 text-xl leading-snug text-ink-soft md:text-2xl">{e.tagline}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t-[1.5px] border-ink/10 pt-5 text-sm">
          <div>
            <dt className="t-label text-ink-faint">Where</dt>
            <dd className="mt-1.5 font-semibold">
              {e.venue.locality}, {AREA_META[e.venue.area].label}
            </dd>
          </div>
          <div>
            <dt className="t-label text-ink-faint">When</dt>
            <dd className="mt-1.5 font-semibold">{formatTimeRange(occ)}</dd>
          </div>
          <div>
            <dt className="t-label text-ink-faint">Price</dt>
            <dd className="mt-1.5 font-semibold">{priceLabel(e.price)}</dd>
          </div>
          <div>
            <dt className="t-label text-ink-faint">Vibe</dt>
            <dd className="mt-1.5 font-semibold">{e.vibes.length ? e.vibes.slice(0, 2).map((v) => VIBE_META[v.tag].label).join(" · ") : "Not confirmed"}</dd>
          </div>
        </dl>
        <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-sindoor">
          Explore this night <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

export { VibeTags };
