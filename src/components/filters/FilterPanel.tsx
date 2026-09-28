"use client";

import { AREA_META, ENTRY_FILTERS, MUSIC_META, NAVRATRI_DAYS, PRICE_BUCKETS, EVENT_TYPE_META } from "@/lib/constants";
import { applyFilters, areaSummaries, type Filters } from "@/lib/discovery";
import { cx, parseDay } from "@/lib/format";
import { AREAS, EVENT_TYPES, MUSIC_STYLES, type EventRecord } from "@/lib/types";

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Group({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="border-t-[1.5px] border-dashed border-ink/15 py-6 first:border-t-0 first:pt-2">
      <legend className="sr-only">{title}</legend>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="t-label text-sindoor" aria-hidden="true">
          {title}
        </h3>
        {hint && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

/** Every filter group. Counts show how many events each choice would leave. */
export function FilterPanel({ events, filters: f, onChange }: { events: EventRecord[]; filters: Filters; onChange: (f: Filters) => void }) {
  const count = (next: Partial<Filters>) => applyFilters(events, { ...f, ...next }).length;
  const localities = f.area ? (areaSummaries(events).find((a) => a.area === f.area)?.localities ?? []) : [];

  return (
    <div>
      <Group title="Night">
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-9 md:grid-cols-5">
          {NAVRATRI_DAYS.map((d) => {
            const p = parseDay(d.date);
            const on = f.date === d.date;
            const n = count({ date: d.date });
            return (
              <button
                key={d.date}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...f, date: on ? null : d.date })}
                className={cx(
                  "flex flex-col items-center rounded-2xl border-[1.5px] py-2 transition-all duration-300",
                  on ? "border-ink bg-haldi text-ink shadow-[var(--shadow-print-sm)]" : "border-ink/15 bg-card hover:border-ink",
                  !on && n === 0 && "opacity-40",
                )}
                aria-label={`${p.weekday} ${p.d} October, night ${d.night}, ${n} events`}
              >
                <span className="t-label text-[0.55rem] opacity-70">{p.weekday}</span>
                <span className="font-display text-lg font-bold leading-tight tabular">{p.d}</span>
                <span className="text-[0.6rem] font-semibold opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="City">
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className="chip"
              aria-pressed={f.area === a}
              onClick={() => onChange({ ...f, area: f.area === a ? null : a, locality: null })}
            >
              {AREA_META[a].label}
              <span className="opacity-50">{count({ area: a, locality: null })}</span>
            </button>
          ))}
        </div>
        {localities.length > 0 && (
          <div className="mt-4 rounded-2xl bg-paper-2 p-3" style={{ animation: "rise .5s var(--ease-out-expo) both" }}>
            <p className="t-label mb-3 text-ink-soft">Localities in {AREA_META[f.area!].label}</p>
            <div className="flex flex-wrap gap-1.5">
              {localities.map((l) => (
                <button
                  key={l.name}
                  type="button"
                  className="chip !py-1.5 !text-xs"
                  aria-pressed={f.locality === l.name}
                  onClick={() => onChange({ ...f, locality: f.locality === l.name ? null : l.name })}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Group>

      <Group title="Price" hint="Unconfirmed prices are excluded">
        <div className="flex flex-wrap gap-2">
          {PRICE_BUCKETS.map((b) => (
            <button key={b.id} type="button" className="chip" aria-pressed={f.price === b.id} onClick={() => onChange({ ...f, price: f.price === b.id ? null : b.id })}>
              {b.label}
              <span className="opacity-50">{count({ price: b.id })}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Event type" hint="Match any">
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={f.type.includes(t)} onClick={() => onChange({ ...f, type: toggle(f.type, t) })}>
              {EVENT_TYPE_META[t].label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Music" hint="Match any">
        <div className="flex flex-wrap gap-2">
          {MUSIC_STYLES.map((m) => (
            <button key={m} type="button" className="chip" aria-pressed={f.music.includes(m)} onClick={() => onChange({ ...f, music: toggle(f.music, m) })}>
              {MUSIC_META[m]}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Entry policy" hint="Only confirmed rules match">
        <div className="grid gap-2">
          {ENTRY_FILTERS.map((x) => {
            const on = f.entry.includes(x.id);
            return (
              <button
                key={x.id}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onChange({ ...f, entry: toggle(f.entry, x.id) })}
                className="flex items-center justify-between rounded-2xl border-[1.5px] border-ink/15 bg-card px-4 py-3 text-left text-sm font-bold transition-colors hover:border-ink"
              >
                <span>
                  {x.label}
                  <span className="ml-2 text-xs font-medium text-ink-faint">{count({ entry: toggle(f.entry, x.id) })} events</span>
                </span>
                <span className={cx("relative h-6 w-11 rounded-full border-[1.5px] border-ink transition-colors duration-300", on ? "bg-sindoor" : "bg-paper-2")} aria-hidden="true">
                  <span className={cx("absolute top-[3px] size-[15px] rounded-full border-[1.5px] border-ink bg-card transition-transform duration-300 ease-[var(--ease-out-expo)]", on ? "translate-x-[21px]" : "translate-x-[3px]")} />
                </span>
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}
