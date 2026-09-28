import Link from "next/link";
import { AREA_META, EVENT_TYPE_META } from "@/lib/constants";
import type { EventRecord } from "@/lib/types";
import { EventMedia } from "../art/EventMedia";
import { BookmarkButton, ShareButton } from "../events/actions";
import { Icon } from "../ui/Icon";

/** Framed poster (or authorised photo) — the ticket panel overlaps its lower edge. */
export function EventHero({ event: e }: { event: EventRecord }) {
  return (
    <header className="relative bg-paper pt-[calc(var(--nav-h)+1rem)] md:pt-[calc(var(--nav-h)+1.5rem)]">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" className="t-meta flex animate-rise flex-wrap items-center gap-2 text-ink-soft">
          <Link href="/events" className="hover:text-ink hover:underline">
            Events
          </Link>
          <Icon name="chevronRight" size={12} />
          <Link href={`/events?area=${e.venue.area}`} className="hover:text-ink hover:underline">
            {AREA_META[e.venue.area].label}
          </Link>
          <Icon name="chevronRight" size={12} />
          <Link href={`/events?area=${e.venue.area}&locality=${encodeURIComponent(e.venue.locality)}`} className="font-semibold text-ink hover:underline">
            {e.venue.locality}
          </Link>
        </nav>
        <div className="relative mt-4 h-[52svh] min-h-[22rem] animate-fade overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink [animation-duration:.9s] md:mt-5 md:h-[62svh] md:rounded-[2rem]">
          <div className="absolute inset-[-6%]" data-parallax style={{ "--p": 0.12 } as React.CSSProperties}>
            <EventMedia event={e} priority sizes="100vw" />
          </div>
          {e.media[0]?.credit && (
            <p className="absolute bottom-3 right-4 rounded bg-ink/70 px-2 py-1 text-[0.65rem] font-semibold text-cream">
              Photo: {e.media[0].credit}
              {e.media[0].year ? ` · ${e.media[0].year}` : ""}
            </p>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5 md:left-6 md:top-6">
            {e.types.map((t) => (
              <span key={t} className="tag border-[1.5px] border-ink bg-card text-ink">
                {EVENT_TYPE_META[t].label}
              </span>
            ))}
          </div>
          <div className="absolute right-4 top-4 flex gap-2 md:right-6 md:top-6">
            <BookmarkButton slug={e.slug} title={e.title} />
            <ShareButton path={`/events/${e.slug}`} title={e.title} />
          </div>
        </div>
      </div>
    </header>
  );
}
