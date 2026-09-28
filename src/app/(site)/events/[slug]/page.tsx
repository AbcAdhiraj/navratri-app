import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel, MobileBookingBar } from "@/components/detail/BookingPanel";
import { CrowdSignal } from "@/components/detail/CrowdSignal";
import { EventHero } from "@/components/detail/EventHero";
import { entryRows, entrySummary, foodSummary, musicSummary, NOT_CONFIRMED } from "@/components/detail/facts";
import { Gallery } from "@/components/detail/Gallery";
import { DetailSection, InfoBlock, TriIcon } from "@/components/detail/InfoBlock";
import { TicketPanel } from "@/components/detail/TicketPanel";
import { TrustPanel } from "@/components/detail/TrustPanel";
import { VibeSection } from "@/components/detail/VibeSection";
import { EventCard } from "@/components/events/cards";
import { EventCarousel } from "@/components/events/EventCarousel";
import { Icon } from "@/components/ui/Icon";
import { AREA_META, SITE_NAME, siteUrl } from "@/lib/constants";
import { getEventBySlug, getPublishedEvents } from "@/lib/data";
import { onDate, sortEvents } from "@/lib/discovery";
import { formatDateRange, formatDay, formatTimeRange, priceLabel } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const { events } = await getPublishedEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Event not found" };
  const where = `${e.venue.name}, ${e.venue.locality}, ${AREA_META[e.venue.area].label}`;
  const description = [e.tagline, `${formatDateRange(e.occurrences)} · ${where} · ${priceLabel(e.price)}`].filter(Boolean).join(" — ");
  return {
    title: e.title,
    description,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: { type: "website", title: e.title, description, url: `/events/${e.slug}`, siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: e.title, description },
    // Fixtures must never be indexed as real events.
    robots: e.isDemo ? { index: false, follow: false } : undefined,
  };
}

function jsonLd(e: EventRecord) {
  const occ = e.occurrences[0];
  const start = occ ? `${occ.date}${occ.startTime ? `T${occ.startTime}:00+05:30` : ""}` : undefined;
  const lastOcc = e.occurrences[e.occurrences.length - 1];
  const end = lastOcc ? `${lastOcc.date}${lastOcc.endTime ? `T${lastOcc.endTime}:00+05:30` : ""}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.tagline ?? e.description ?? undefined,
    startDate: start,
    endDate: end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.venue.name,
      address: { "@type": "PostalAddress", streetAddress: e.venue.address ?? undefined, addressLocality: e.venue.locality, addressRegion: AREA_META[e.venue.area].label, addressCountry: "IN" },
    },
    organizer: e.organizer ? { "@type": "Organization", name: e.organizer.name, url: e.organizer.url ?? undefined } : undefined,
    offers:
      e.price.status === "paid" && e.price.minInr != null && e.booking?.verified
        ? { "@type": "Offer", price: e.price.minInr, priceCurrency: "INR", url: e.booking.url, availability: "https://schema.org/InStock" }
        : e.price.status === "free"
          ? { "@type": "Offer", price: 0, priceCurrency: "INR" }
          : undefined,
    url: siteUrl(`/events/${e.slug}`),
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const [e, { events }] = await Promise.all([getEventBySlug(slug), getPublishedEvents()]);
  if (!e) notFound();

  const entry = entrySummary(e);
  const food = foodSummary(e);
  const music = musicSummary(e);
  const first = e.occurrences[0];
  const sameNight = sortEvents(events.filter((x) => x.slug !== e.slug && first && onDate(x, first.date)), first?.date);
  const nearby = sortEvents(events.filter((x) => x.slug !== e.slug && x.venue.area === e.venue.area));
  const related = (nearby.length >= 3 ? nearby : sameNight).slice(0, 8);

  return (
    <article className="bg-paper pb-24 lg:pb-0">
      {!e.isDemo && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(e)).replace(/</g, "\\u003c") }} />}
      <EventHero event={e} />

      <div className="relative mx-auto grid max-w-[90rem] gap-8 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12 lg:px-12">
        <div className="min-w-0">
          <TicketPanel event={e} className="relative z-10 -mt-16 md:-mt-28 md:mr-10 lg:mr-0" />

          {/* Key facts */}
          <section aria-label="Key details" className="grid gap-3 py-10 sm:grid-cols-2 md:py-12 xl:grid-cols-3">
            <InfoBlock icon="calendar" label="Date & time">
              {first ? formatDay(first.date, { weekday: true }) : NOT_CONFIRMED}
              <span className="t-meta mt-1 block font-sans text-ink-soft">{first ? formatTimeRange(first) : "Time not confirmed"}</span>
            </InfoBlock>
            <InfoBlock icon="pin" label="Location">
              {e.venue.locality}, {AREA_META[e.venue.area].label}
              <span className="t-meta mt-1 block font-sans text-ink-soft">{e.venue.address ?? e.venue.name}</span>
            </InfoBlock>
            <InfoBlock icon="ticket" label="Price" muted={e.price.status === "unknown"}>
              {priceLabel(e.price, "long")}
              {e.price.note && <span className="t-meta mt-1 block font-sans text-ink-soft">{e.price.note}</span>}
            </InfoBlock>
            <InfoBlock icon="music" label="Music" muted={!e.music.length}>
              {music}
            </InfoBlock>
            <InfoBlock icon="users" label="Entry" muted={!entry.length}>
              {entry.length ? entry.join(" · ") : NOT_CONFIRMED}
            </InfoBlock>
            <InfoBlock icon="food" label="Food" muted={food === NOT_CONFIRMED}>
              {food}
              {e.food.note && <span className="t-meta mt-1 block font-sans text-ink-soft">{e.food.note}</span>}
            </InfoBlock>
          </section>

          {e.occurrences.length > 1 && (
            <DetailSection id="nights" kicker={`${e.occurrences.length} nights`} title="Pick your night">
              <ul className="flex flex-wrap gap-2">
                {e.occurrences.map((o) => (
                  <li key={o.date} className="rounded-2xl border-[1.5px] border-ink/15 bg-card px-4 py-3">
                    <p className="font-display text-lg font-bold leading-tight">{formatDay(o.date, { weekday: true })}</p>
                    <p className="t-meta text-ink-soft">{formatTimeRange(o)}</p>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          <DetailSection id="vibe" kicker="What’s the vibe?" title="How this night feels">
            <VibeSection event={e} />
          </DetailSection>

          {(e.description || e.organizer) && (
            <DetailSection id="about" kicker="About" title="The details">
              {e.description && <p className="t-body max-w-2xl text-lg text-ink-soft">{e.description}</p>}
              {e.organizer && (
                <p className="t-meta mt-5 text-ink-soft">
                  Organized by{" "}
                  {e.organizer.url ? (
                    <a href={e.organizer.url} target="_blank" rel="noopener noreferrer nofollow" className="font-bold text-ink underline underline-offset-2">
                      {e.organizer.name}
                    </a>
                  ) : (
                    <b className="text-ink">{e.organizer.name}</b>
                  )}
                </p>
              )}
            </DetailSection>
          )}

          <DetailSection id="entry" kicker="Entry rules" title="Before you go">
            <ul className="divide-y-[1.5px] divide-dashed divide-ink/10 rounded-[var(--radius-card)] border-[1.5px] border-ink/15 bg-card px-5">
              {entryRows(e).map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-4 py-3.5">
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className="flex items-center gap-2.5 text-sm">
                    <span className="text-ink-soft">{r.text ?? (r.value === true ? "Yes" : r.value === false ? "No" : NOT_CONFIRMED)}</span>
                    <TriIcon value={r.value} />
                  </span>
                </li>
              ))}
            </ul>
            {e.entry.note && <p className="t-meta mt-3 text-ink-soft">{e.entry.note}</p>}
          </DetailSection>

          <DetailSection id="crowd" kicker="Crowd" title="Who goes?">
            <CrowdSignal event={e} />
          </DetailSection>

          {e.media.length > 1 && (
            <DetailSection id="gallery" kicker="Gallery" title="From past editions">
              <Gallery media={e.media} />
            </DetailSection>
          )}

          <DetailSection id="trust" kicker="Trust" title="Where this comes from">
            <TrustPanel event={e} />
          </DetailSection>

          <section aria-label="Corrections" className="mb-12 flex flex-col items-start gap-4 rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-haldi p-6 md:flex-row md:items-center md:justify-between md:p-8" data-reveal>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight">Spot something wrong?</p>
              <p className="t-meta mt-1 text-ink">Corrections are reviewed by a moderator before anything changes.</p>
            </div>
            <Link href={`/submit?kind=correction&event=${e.slug}`} className="btn btn-paper">
              Correct this event <Icon name="edit" size={15} />
            </Link>
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Booking">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] z-10 -mt-28 pb-12">
            <BookingPanel event={e} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t-[1.5px] border-ink bg-paper-2 py-16 md:py-20">
          <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
            <p className="kicker">Keep exploring</p>
            <h2 id="related-title" className="t-h2 mb-10 mt-3">
              {nearby.length >= 3 ? `More in ${AREA_META[e.venue.area].label}` : `Also on ${first ? formatDay(first.date, { weekday: true }) : "this night"}`}
            </h2>
          </div>
          <div className="mx-auto max-w-[90rem]">
            <EventCarousel label="Related events" itemClassName="w-[74vw] sm:w-[19rem] lg:w-[20.5rem]">
              {related.map((x) => (
                <EventCard key={x.slug} event={x} className="h-full" />
              ))}
            </EventCarousel>
          </div>
        </section>
      )}

      <MobileBookingBar event={e} />
    </article>
  );
}
