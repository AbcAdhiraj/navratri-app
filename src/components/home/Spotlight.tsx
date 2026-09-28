import { ToranaEdge } from "../art/Motifs";
import { EditorialCard } from "../events/cards";
import type { EventRecord } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

/** Indigo block: asymmetric editorial spotlight on the biggest featured nights. */
export function Spotlight({ events }: { events: EventRecord[] }) {
  if (events.length < 2) return null;
  return (
    <section aria-labelledby="spotlight-title" className="on-dark relative bg-neel pb-24 pt-20 md:pb-32 md:pt-28">
      <ToranaEdge className="absolute inset-x-0 -top-px h-6 w-full rotate-180" fill="var(--color-paper)" />
      <div aria-hidden="true" className="bandhani-ring absolute inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <SectionHeader
          id="spotlight-title"
          kicker="Spotlight"
          title="The nights everyone’s"
          accent="planning around."
          accentClass="text-haldi"
          blurb="Our pick of the biggest productions this Navratri — chosen for scale and confirmed details, never for payment."
          href="/events?type=ticketed"
          hrefLabel="All big nights"
        />
        <div className="grid gap-16 text-ink md:gap-24">
          {events.slice(0, 3).map((e, i) => (
            <div key={e.slug} data-reveal>
              <EditorialCard event={e} index={i + 1} reverse={i % 2 === 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
