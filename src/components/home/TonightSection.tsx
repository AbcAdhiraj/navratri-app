"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { NAVRATRI_DAYS } from "@/lib/constants";
import { onDate, sortEvents } from "@/lib/discovery";
import { formatDay } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { GarbaRing } from "../art/Motifs";
import { EventCard, FeaturedEventCard, HorizontalEventCard } from "../events/cards";
import { DateSelector } from "../events/DateSelector";
import { Icon } from "../ui/Icon";

export function TonightSection({ events, initialDate, today }: { events: EventRecord[]; initialDate: string; today: string | null }) {
  const [date, setDate] = useState(initialDate);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => Object.fromEntries(NAVRATRI_DAYS.map((d) => [d.date, events.filter((e) => onDate(e, d.date)).length])), [events]);
  const list = useMemo(() => sortEvents(events.filter((e) => onDate(e, date)), date), [events, date]);
  const night = NAVRATRI_DAYS.find((d) => d.date === date)!.night;
  const isTonight = today === date;
  const [lead, ...rest] = list;
  const side = rest.slice(0, 2);
  const more = rest.slice(2);

  const heading = isTonight ? "Tonight" : night === 1 ? "Opening night" : night === 9 ? "The final night" : `Night ${night}`;

  return (
    <section id="tonight" aria-labelledby="tonight-title" className="grain relative scroll-mt-20 bg-paper pb-20 pt-20 md:pb-28 md:pt-24">
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <p className="kicker">
              {isTonight ? "Live · " : ""}
              {formatDay(date, { weekday: true })}
            </p>
            <h2 id="tonight-title" className="t-h1 mt-4">
              {heading}
              <span className="t-serif text-sindoor">, sorted.</span>
            </h2>
            <p className="t-body mt-3 text-ink-soft" aria-live="polite">
              <b className="text-ink tabular">{list.length}</b> event{list.length === 1 ? "" : "s"} across all cities on {formatDay(date, { weekday: true })}.
            </p>
          </div>
          <Link href={`/events?date=${date}`} className="btn btn-outline btn-sm self-start md:self-auto">
            All events this night <Icon name="arrowRight" size={16} className="btn-arrow" />
          </Link>
        </div>

        <div className="sticky top-[var(--nav-h)] z-30 -mx-4 mt-8 border-b-[1.5px] border-ink/10 bg-paper/95 px-3 backdrop-blur md:static md:mx-0 md:mt-10 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <DateSelector value={date} onChange={(d) => startTransition(() => setDate(d))} counts={counts} today={today} controls="tonight-panel" />
        </div>

        <div id="tonight-panel" role="tabpanel" aria-label={`Events on ${formatDay(date, { weekday: true })}`} className="mt-8 md:mt-10">
          <div key={date} style={{ animation: "rise .6s var(--ease-out-expo) both" }}>
            {list.length === 0 ? (
              <div className="flex flex-col items-center rounded-[var(--radius-panel)] border-[1.5px] border-dashed border-ink/25 px-6 py-16 text-center">
                <GarbaRing className="size-20 text-sindoor motion-safe:animate-spin-slow" />
                <p className="t-h3 mt-5">Nothing listed for this night — yet.</p>
                <p className="t-body mt-2 max-w-md text-ink-soft">Events get added as organizers confirm. Try another night, or tell us about one we’re missing.</p>
                <Link href="/submit" className="btn btn-outline btn-sm mt-6">
                  Suggest an event
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-5 lg:grid-cols-12">
                  <FeaturedEventCard event={lead} focusDate={date} className="lg:col-span-7 lg:min-h-[38rem]" priority />
                  {side.length > 0 && (
                    <div className="hidden gap-5 lg:col-span-5 lg:grid lg:grid-rows-2">
                      {side.map((e) => (
                        <FeaturedEventCard key={e.slug} event={e} focusDate={date} className="!min-h-0 [&_.t-h2]:!text-[1.5rem] [&_p.line-clamp-2]:hidden" />
                      ))}
                    </div>
                  )}
                </div>
                {rest.length > 0 && (
                  <ul className="mt-4 grid gap-3 lg:hidden">
                    {rest.slice(0, 4).map((e) => (
                      <li key={e.slug}>
                        <HorizontalEventCard event={e} focusDate={date} />
                      </li>
                    ))}
                  </ul>
                )}
                {more.length > 0 && (
                  <div className="mt-5 hidden gap-5 lg:grid lg:grid-cols-4">
                    {more.slice(0, 4).map((e) => (
                      <EventCard key={e.slug} event={e} focusDate={date} />
                    ))}
                  </div>
                )}
                {list.length > 5 && (
                  <div className="mt-10 flex justify-center">
                    <Link href={`/events?date=${date}`} className="btn btn-red">
                      See all {list.length} on {formatDay(date)} <Icon name="arrowRight" className="btn-arrow" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
