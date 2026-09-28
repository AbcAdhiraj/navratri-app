import Link from "next/link";
import { BudgetSection } from "@/components/home/BudgetSection";
import { DiscoveryControl } from "@/components/home/DiscoveryControl";
import { Hero } from "@/components/home/Hero";
import { LocalityGrid } from "@/components/home/LocalityGrid";
import { RailSection } from "@/components/home/RailSection";
import { Spotlight } from "@/components/home/Spotlight";
import { SubmitCTA } from "@/components/home/SubmitCTA";
import { TonightSection } from "@/components/home/TonightSection";
import { TrustBand } from "@/components/home/TrustBand";
import { VibeGrid } from "@/components/home/VibeGrid";
import { Icon } from "@/components/ui/Icon";
import { ErrorState } from "@/components/ui/States";
import { NAVRATRI_END, NAVRATRI_START } from "@/lib/constants";
import { getPublishedEvents } from "@/lib/data";
import { areaSummaries, countByDate, editorialSections, focusDate, sortEvents } from "@/lib/discovery";
import { relativeChecked, todayIST } from "@/lib/format";
import { AREAS, type Area } from "@/lib/types";

export const revalidate = 300;

export default async function HomePage() {
  const { events, error } = await getPublishedEvents();

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-36">
        <ErrorState />
      </div>
    );
  }

  const focus = focusDate();
  const today = todayIST();
  const inFestival = today >= NAVRATRI_START && today <= NAVRATRI_END;
  const featured = sortEvents(events.filter((e) => e.featured));
  const sections = editorialSections(events);
  const byId = Object.fromEntries(sections.map((s) => [s.id, s]));
  const areaCounts = Object.fromEntries(areaSummaries(events).map((a) => [a.area, a.count])) as Record<Area, number>;
  for (const a of AREAS) areaCounts[a] ??= 0;
  const lastChecked = events
    .map((e) => e.verification.lastCheckedAt)
    .filter((x): x is string => !!x)
    .sort()
    .at(-1);

  return (
    <>
      <Hero events={events} posters={featured.length >= 3 ? featured : sortEvents(events)} />
      <DiscoveryControl countsByDate={countByDate(events)} countsByArea={areaCounts} total={events.length} />
      <TonightSection events={events} initialDate={focus.date} today={inFestival ? today : null} />
      <Spotlight events={featured.filter((e) => e.scale === "large").concat(featured.filter((e) => e.scale !== "large"))} />
      <VibeGrid events={events} />
      {byId["garba-guide"] && <RailSection section={byId["garba-guide"]} tone="paper" />}
      <LocalityGrid events={events} />
      {byId["after-dark"] && <RailSection section={byId["after-dark"]} tone="ink" />}
      <BudgetSection under={byId["under-500"]} free={byId["free"]} />
      {byId["community"] && <RailSection section={byId["community"]} tone="paper2" />}
      {byId["big-nights"] && !featured.length && <RailSection section={byId["big-nights"]} />}
      <section aria-label="Browse everything" className="bg-paper-2 pb-24 pt-4">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center px-4 text-center md:px-8">
          <p className="t-serif text-2xl text-ink-soft md:text-3xl">Still deciding?</p>
          <Link href="/events" className="group mt-4 inline-flex items-center gap-4">
            <span className="t-h1 transition-colors group-hover:text-sindoor">Browse all {events.length} events</span>
            <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-haldi text-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 md:size-16">
              <Icon name="arrowRight" size={24} />
            </span>
          </Link>
        </div>
      </section>
      <TrustBand lastChecked={lastChecked ? relativeChecked(lastChecked) : null} />
      <SubmitCTA />
    </>
  );
}
