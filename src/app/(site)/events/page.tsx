import type { Metadata } from "next";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { ErrorState } from "@/components/ui/States";
import { getPublishedEvents } from "@/lib/data";
import { describeFilters, filtersToQuery, parseFilters } from "@/lib/discovery";

export async function generateMetadata({ searchParams }: PageProps<"/events">): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const d = describeFilters(f);
  const title = `${d.title}${d.accent ? ` ${d.accent}` : ""}`;
  const canonical = `/events${filtersToQuery({ ...f, q: "" })}`;
  return {
    title,
    description: d.description,
    alternates: { canonical },
    openGraph: { title, description: d.description, url: canonical },
    robots: f.q ? { index: false, follow: true } : undefined,
  };
}

export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const [{ events, error }, sp] = await Promise.all([getPublishedEvents(), searchParams]);
  const initial = parseFilters(sp);
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-36">
        <ErrorState />
      </div>
    );
  }
  return <EventsExplorer key={filtersToQuery(initial)} events={events} initial={initial} />;
}
