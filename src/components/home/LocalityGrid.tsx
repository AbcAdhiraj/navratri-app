import { areaSummaries } from "@/lib/discovery";
import type { EventRecord } from "@/lib/types";
import { LocalityCard } from "../events/LocalityCard";
import { SectionHeader } from "./SectionHeader";

export function LocalityGrid({ events }: { events: EventRecord[] }) {
  const areas = areaSummaries(events).sort((a, b) => b.count - a.count);
  if (!areas.some((a) => a.count > 0)) return null;
  const [lead, ...rest] = areas;
  return (
    <section id="localities" aria-labelledby="localities-title" className="grain relative scroll-mt-20 bg-paper py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <SectionHeader id="localities-title" kicker="Around you" title="Pick a city," accent="find your circle." blurb="From Dwarka society lawns to Gurugram arenas — browse Navratri by where you’ll actually be." />
        <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          <div data-reveal className="md:col-span-2 md:row-span-2">
            <LocalityCard summary={lead} size="lg" className="min-h-[22rem] md:min-h-full" />
          </div>
          {rest.map((a, i) => (
            <div key={a.area} data-reveal style={{ "--i": i + 1 } as React.CSSProperties}>
              <LocalityCard summary={a} className="min-h-[15rem]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
