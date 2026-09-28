"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { AREA_META, EVENT_TYPE_META } from "@/lib/constants";
import type { SearchItem } from "@/lib/discovery";
import { cx, formatDay } from "@/lib/format";
import type { EventType } from "@/lib/types";
import { paletteFor } from "../art/seed";
import { GarbaRing } from "../art/Motifs";
import { Icon } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");

const POPULAR_TYPES: EventType[] = ["garba", "dandiya", "bollywood", "dj_edm", "community"];

function Highlight({ text, q }: { text: string; q: string }) {
  const t = q.trim();
  if (!t) return <>{text}</>;
  const i = text.toLowerCase().indexOf(t.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-haldi px-0.5 text-ink">{text.slice(i, i + t.length)}</mark>
      {text.slice(i + t.length)}
    </>
  );
}

export function SearchOverlay({ open, onClose, items, focusDate }: { open: boolean; onClose: () => void; items: SearchItem[]; focusDate: string }) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const localities = useMemo(() => {
    const m = new Map<string, { name: string; area: SearchItem["area"]; count: number }>();
    for (const it of items) {
      const k = `${it.area}:${it.locality}`;
      m.set(k, { name: it.locality, area: it.area, count: (m.get(k)?.count ?? 0) + 1 });
    }
    return [...m.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  const results = useMemo(() => {
    const terms = norm(dq).split(/\s+/).filter(Boolean);
    if (!terms.length) return null;
    const scored = items
      .map((it) => {
        const hay = norm([it.title, it.venue, it.locality, AREA_META[it.area].label, it.organizer ?? ""].join(" "));
        if (!terms.every((t) => hay.includes(t))) return null;
        const title = norm(it.title);
        const score = terms.reduce((s, t) => s + (title.includes(t) ? 3 : 0) + (norm(it.locality).includes(t) ? 2 : 0), 0);
        return { it, score };
      })
      .filter((x): x is { it: SearchItem; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it);
    const locs = localities.filter((l) => terms.every((t) => norm(`${l.name} ${AREA_META[l.area].label}`).includes(t))).slice(0, 4);
    return { events: scored.slice(0, 8), total: scored.length, locs };
  }, [dq, items, localities]);

  const tonight = useMemo(() => items.filter((i) => i.dates.includes(focusDate)).slice(0, 4), [items, focusDate]);

  const hrefs: string[] = results
    ? [
        ...results.locs.map((l) => `/events?area=${l.area}&locality=${encodeURIComponent(l.name)}`),
        ...results.events.map((e) => `/events/${e.slug}`),
        `/events?q=${encodeURIComponent(q.trim())}`,
      ]
    : [];

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Search" variant="full" hideHeader>
      <div className="mx-auto flex w-full max-w-3xl flex-col pt-4 md:pt-16">
        <div className="flex items-center gap-3 border-b-[2.5px] border-ink/20 pb-3 transition-colors focus-within:border-sindoor">
          <Icon name="search" size={26} className="shrink-0 text-sindoor" />
          <label htmlFor="site-search" className="sr-only">
            Search events, venues, localities
          </label>
          <input
            id="site-search"
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (!hrefs.length) {
                if (e.key === "Enter" && q.trim()) go(`/events?q=${encodeURIComponent(q.trim())}`);
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => (a + 1) % hrefs.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => (a - 1 + hrefs.length) % hrefs.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(hrefs[active]);
              }
            }}
            placeholder="Search events, venues, localities…"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            role="combobox"
            aria-expanded={!!results}
            aria-controls="search-results"
            aria-activedescendant={results ? `sr-${active}` : undefined}
            className="w-full bg-transparent font-display text-2xl font-bold tracking-tight text-ink placeholder:text-ink-faint focus:outline-none md:text-4xl"
          />
          <button type="button" onClick={onClose} className="icon-btn shrink-0 border-[1.5px] border-ink/20 hover:border-ink" aria-label="Close search">
            <Icon name="x" />
          </button>
        </div>
        <p className="t-meta mt-2 hidden text-ink-faint md:block">
          <kbd className="rounded border-[1.5px] border-ink/25 bg-card px-1.5 py-0.5 text-[0.7rem]">↑</kbd>{" "}
          <kbd className="rounded border-[1.5px] border-ink/25 bg-card px-1.5 py-0.5 text-[0.7rem]">↓</kbd> to move ·{" "}
          <kbd className="rounded border-[1.5px] border-ink/25 bg-card px-1.5 py-0.5 text-[0.7rem]">Enter</kbd> to open ·{" "}
          <kbd className="rounded border-[1.5px] border-ink/25 bg-card px-1.5 py-0.5 text-[0.7rem]">Esc</kbd> to close
        </p>

        <div id="search-results" role="listbox" aria-label="Search results" className="mt-8 pb-16">
          {!results && (
            <div className="grid gap-10" style={{ animation: "fade .4s ease both" }}>
              <section>
                <h3 className="kicker mb-4">Popular localities</h3>
                <div className="flex flex-wrap gap-2">
                  {localities.slice(0, 10).map((l) => (
                    <Link key={`${l.area}${l.name}`} href={`/events?area=${l.area}&locality=${encodeURIComponent(l.name)}`} onClick={onClose} className="chip">
                      <Icon name="pin" size={13} className="text-sindoor" />
                      {l.name}
                      <span className="opacity-50">{l.count}</span>
                    </Link>
                  ))}
                </div>
              </section>
              {tonight.length > 0 && (
                <section>
                  <h3 className="kicker mb-4">On {formatDay(focusDate, { weekday: true })}</h3>
                  <ul className="grid gap-1">
                    {tonight.map((it) => (
                      <li key={it.slug}>
                        <ResultLink it={it} q="" onClick={onClose} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="kicker mb-4">Browse by type</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TYPES.map((t) => (
                    <Link key={t} href={`/events?type=${t}`} onClick={onClose} className="chip">
                      {EVENT_TYPE_META[t].plural}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {results && results.total === 0 && results.locs.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center" style={{ animation: "fade .4s ease both" }}>
              <GarbaRing className="size-24 text-sindoor motion-safe:animate-spin-slow" />
              <p className="t-h3 mt-6">Nothing matches “{dq}”</p>
              <p className="t-body mt-2 max-w-sm text-ink-soft">Try a locality like “Dwarka” or “Sector 18”, or a type like “dandiya”.</p>
              <Link href="/submit" onClick={onClose} className="btn btn-outline btn-sm mt-6">
                Know an event we’re missing?
              </Link>
            </div>
          )}

          {results && (results.total > 0 || results.locs.length > 0) && (
            <div className="grid gap-8">
              {results.locs.length > 0 && (
                <section>
                  <h3 className="kicker mb-3">Localities</h3>
                  <ul className="grid gap-1">
                    {results.locs.map((l, i) => (
                      <li key={`${l.area}${l.name}`}>
                        <Link
                          id={`sr-${i}`}
                          role="option"
                          aria-selected={active === i}
                          href={hrefs[i]}
                          onClick={onClose}
                          onMouseEnter={() => setActive(i)}
                          className={cx("flex items-center gap-4 rounded-2xl border-[1.5px] border-transparent px-3 py-3 transition-colors", active === i && "border-ink bg-card")}
                        >
                          <span className="grid size-11 place-items-center rounded-xl border-[1.5px] border-ink bg-haldi text-ink">
                            <Icon name="pin" />
                          </span>
                          <span className="flex-1">
                            <span className="block font-semibold">
                              <Highlight text={l.name} q={dq} />
                            </span>
                            <span className="t-meta text-ink-soft">
                              {AREA_META[l.area].label} · {l.count} event{l.count > 1 ? "s" : ""}
                            </span>
                          </span>
                          <Icon name="arrowRight" className="text-sindoor" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {results.events.length > 0 && (
                <section>
                  <h3 className="kicker mb-3">Events</h3>
                  <ul className="grid gap-1">
                    {results.events.map((it, j) => {
                      const i = results.locs.length + j;
                      return (
                        <li key={it.slug}>
                          <ResultLink it={it} q={dq} id={`sr-${i}`} active={active === i} onHover={() => setActive(i)} onClick={onClose} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              <Link
                id={`sr-${hrefs.length - 1}`}
                role="option"
                aria-selected={active === hrefs.length - 1}
                href={hrefs[hrefs.length - 1]}
                onClick={onClose}
                onMouseEnter={() => setActive(hrefs.length - 1)}
                className={cx("btn w-full", active === hrefs.length - 1 ? "btn-red" : "btn-outline")}
              >
                See all {results.total} result{results.total === 1 ? "" : "s"} for “{dq}” <Icon name="arrowRight" className="btn-arrow" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function ResultLink({
  it,
  q,
  id,
  active,
  onHover,
  onClick,
}: {
  it: SearchItem;
  q: string;
  id?: string;
  active?: boolean;
  onHover?: () => void;
  onClick: () => void;
}) {
  const p = paletteFor(it.seed, it.type ?? undefined);
  const title = it.isDemo ? it.title.replace(/^DEMO\s*[—–-]\s*/, "") : it.title;
  return (
    <Link
      id={id}
      role={id ? "option" : undefined}
      aria-selected={id ? !!active : undefined}
      href={`/events/${it.slug}`}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cx("flex items-center gap-4 rounded-2xl border-[1.5px] border-transparent px-3 py-3 transition-colors hover:bg-card", active && "border-ink bg-card")}
    >
      <span
        className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border-[1.5px] border-ink"
        style={{ background: p.bg }}
        aria-hidden="true"
      >
        <span className="size-3 rounded-full border-2" style={{ borderColor: p.motif }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">
          {it.isDemo && <span className="mr-1.5 rounded border-[1.5px] border-dashed border-ink bg-haldi px-1 text-[0.58rem] font-extrabold tracking-widest text-ink">DEMO</span>}
          <Highlight text={title} q={q} />
        </span>
        <span className="t-meta block truncate text-ink-soft">
          <Highlight text={it.venue} q={q} /> · <Highlight text={it.locality} q={q} />
          {it.organizer ? (
            <>
              {" "}
              · <Highlight text={it.organizer} q={q} />
            </>
          ) : null}
        </span>
      </span>
      <span className="hidden text-right text-sm font-semibold sm:block">
        {it.price}
        <span className="t-meta block font-normal text-ink-faint">{formatDay(it.dates[0])}</span>
      </span>
    </Link>
  );
}
