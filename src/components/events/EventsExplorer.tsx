"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AREA_META, ENTRY_FILTERS, EVENT_TYPE_META, MUSIC_META, NAVRATRI_DAYS, PRICE_BUCKETS } from "@/lib/constants";
import {
  activeFilterCount,
  applyFilters,
  describeFilters,
  EMPTY_FILTERS,
  filtersToQuery,
  sortBy,
  type Filters,
  type SortKey,
} from "@/lib/discovery";
import { cx, parseDay } from "@/lib/format";
import { useViewPreference } from "@/lib/saved";
import { AREAS, type Area, type EventRecord } from "@/lib/types";
import { GarbaRing } from "../art/Motifs";
import { FilterSheet } from "../filters/FilterSheet";
import { Icon } from "../ui/Icon";
import { Segmented } from "../ui/Segmented";
import { EmptyState } from "../ui/States";
import { EventCard, EventRow } from "./cards";
import { AREA_HUE } from "./LocalityCard";

type View = "grid" | "list";

export function EventsExplorer({ events, initial }: { events: EventRecord[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const [sheet, setSheet] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useViewPreference();

  const update = useCallback((next: Filters) => {
    setF(next);
    window.history.replaceState(null, "", `/events${filtersToQuery(next)}`);
  }, []);

  const results = useMemo(() => sortBy(applyFilters(events, f), sort, f.date), [events, f, sort]);
  const d = describeFilters(f);
  const active = activeFilterCount(f);
  const resultsKey = filtersToQuery(f) + sort + view;

  const chips: { label: string; clear: Filters }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: { ...f, q: "" } });
  if (f.date) chips.push({ label: `${parseDay(f.date).weekday} ${parseDay(f.date).d} Oct`, clear: { ...f, date: null } });
  if (f.area) chips.push({ label: AREA_META[f.area].label, clear: { ...f, area: null, locality: null } });
  if (f.locality) chips.push({ label: f.locality, clear: { ...f, locality: null } });
  if (f.price) chips.push({ label: PRICE_BUCKETS.find((b) => b.id === f.price)!.label, clear: { ...f, price: null } });
  f.type.forEach((t) => chips.push({ label: EVENT_TYPE_META[t].label, clear: { ...f, type: f.type.filter((x) => x !== t) } }));
  f.music.forEach((m) => chips.push({ label: MUSIC_META[m], clear: { ...f, music: f.music.filter((x) => x !== m) } }));
  f.entry.forEach((x) => chips.push({ label: ENTRY_FILTERS.find((e) => e.id === x)!.label, clear: { ...f, entry: f.entry.filter((y) => y !== x) } }));

  const hue = f.area ? AREA_HUE[f.area] : null;
  const onColor = hue ? !hue.ink : false;

  return (
    <>
      {/* ── Header: each city gets its own dye ── */}
      <header
        className={cx("relative overflow-hidden pb-10 pt-32 transition-colors duration-500 md:pb-14 md:pt-40", onColor ? "on-color text-cream" : "text-ink", !hue && "bg-paper-2")}
        style={hue ? { background: hue.bg } : undefined}
      >
        <div aria-hidden="true" className="bandhani absolute inset-0" style={{ "--dot": onColor ? "rgb(244 236 221 / 0.12)" : "rgb(30 23 19 / 0.1)", "--gap": "18px" } as React.CSSProperties} />
        <GarbaRing aria-hidden="true" className="absolute -right-44 -top-36 size-80 motion-safe:animate-spin-slower md:-right-24 md:-top-16 md:size-[26rem]" color={hue ? hue.ring : "#bd1f1a"} count={56} />
        <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="t-meta flex items-center gap-2 opacity-75">
            <Link href="/" className="hover:underline">
              Explore
            </Link>
            <Icon name="chevronRight" size={12} />
            <span>Events</span>
          </nav>
          <h1 className="t-h1 mt-5 max-w-5xl text-balance" aria-live="polite">
            {d.title}
            {d.accent && <span className={cx("t-serif", onColor ? "text-haldi" : "text-sindoor")}> {d.accent}</span>}
          </h1>
          <p className="t-body mt-4 opacity-80">
            <b className="font-display text-xl tabular opacity-100">{results.length}</b> of {events.length} events
            {f.area && <span> · {AREA_META[f.area].blurb}</span>}
          </p>
        </div>
      </header>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-[var(--nav-h)] z-40 border-b-[1.5px] border-ink bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[90rem] items-center gap-3 px-4 py-3 md:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setSheet(true)}
            className={cx("btn btn-sm shrink-0 !normal-case !tracking-normal", active ? "btn-red" : "btn-paper")}
            aria-haspopup="dialog"
          >
            <Icon name="sliders" size={16} />
            Filters
            {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-cream text-[0.65rem] text-ink">{active}</span>}
          </button>
          <div className="hidden shrink-0 lg:block">
            <Segmented<"all" | Area>
              label="City"
              size="sm"
              value={f.area ?? "all"}
              onChange={(v) => update({ ...f, area: v === "all" ? null : v, locality: null })}
              options={[{ value: "all", label: "All NCR" }, ...AREAS.map((a) => ({ value: a, label: AREA_META[a].label }))]}
            />
          </div>
          <div className="no-scrollbar -mr-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pr-4 md:mr-0 md:pr-0 lg:[&>*:first-child]:ml-auto" role="group" aria-label="Night">
            <button type="button" className="chip shrink-0 !py-2 !text-xs" aria-pressed={!f.date} onClick={() => update({ ...f, date: null })}>
              All nights
            </button>
            {NAVRATRI_DAYS.map((day) => {
              const p = parseDay(day.date);
              return (
                <button
                  key={day.date}
                  type="button"
                  className="chip shrink-0 !gap-1 !py-2 !text-xs"
                  aria-pressed={f.date === day.date}
                  onClick={() => update({ ...f, date: f.date === day.date ? null : day.date })}
                >
                  <span className="opacity-60">{p.weekday}</span>
                  <b className="tabular">{p.d}</b>
                </button>
              );
            })}
          </div>
        </div>
        {chips.length > 0 && (
          <div className="no-scrollbar mx-auto flex max-w-[90rem] items-center gap-2 overflow-x-auto px-4 pb-3 md:px-8 lg:px-12">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => update(c.clear)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-haldi py-1.5 pl-3 pr-2 text-xs font-bold text-ink transition-colors hover:bg-haldi-soft"
                aria-label={`Remove filter ${c.label}`}
                style={{ animation: "scale-in .3s var(--ease-out-expo) both" }}
              >
                {c.label}
                <Icon name="x" size={13} />
              </button>
            ))}
            <button type="button" onClick={() => update({ ...EMPTY_FILTERS })} className="shrink-0 px-2 text-xs font-bold text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <section aria-label="Results" className="grain min-h-[60vh] bg-paper pb-28 pt-8 md:pt-10">
        <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Segmented<SortKey>
              label="Sort by"
              size="sm"
              value={sort}
              onChange={setSort}
              options={[
                { value: "recommended", label: "Featured" },
                { value: "soonest", label: "Soonest" },
                { value: "price", label: "Cheapest" },
              ]}
            />
            <div className="flex items-center gap-1 rounded-full border-[1.5px] border-ink/15 bg-card p-1" role="group" aria-label="View">
              {(["grid", "list"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={v === "grid" ? "Grid view" : "List view"}
                  onClick={() => setView(v)}
                  className={cx("grid size-8 place-items-center rounded-full transition-colors", view === v ? "bg-ink text-cream" : "text-ink-soft hover:text-ink")}
                >
                  <Icon name={v === "grid" ? "grid" : "menu"} size={15} />
                </button>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              action={
                <button type="button" className="btn btn-red" onClick={() => update({ ...EMPTY_FILTERS })}>
                  Clear filters
                </button>
              }
            />
          ) : view === "grid" ? (
            <ul key={resultsKey} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
              {results.map((e, i) => (
                <li key={e.slug} style={{ animation: `rise .6s var(--ease-out-expo) ${Math.min(i, 12) * 40}ms both` }}>
                  <EventCard event={e} focusDate={f.date} className="h-full" />
                </li>
              ))}
            </ul>
          ) : (
            <ul key={resultsKey} className="divide-y-[1.5px] divide-dashed divide-ink/10 rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card p-2 shadow-[var(--shadow-print)] md:p-3">
              {results.map((e, i) => (
                <li key={e.slug} style={{ animation: `rise .5s var(--ease-out-expo) ${Math.min(i, 12) * 30}ms both` }}>
                  <EventRow event={e} focusDate={f.date} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} events={events} filters={f} onChange={update} />
    </>
  );
}
