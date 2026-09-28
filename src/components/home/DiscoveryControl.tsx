"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AREA_META, NAVRATRI_DAYS, PRICE_BUCKETS, type PriceBucket } from "@/lib/constants";
import { cx, formatDay, parseDay } from "@/lib/format";
import { AREAS, type Area } from "@/lib/types";
import { VIBE_OPTIONS } from "@/lib/vibes";
import { Icon } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";

type Seg = "date" | "area" | "vibe" | "price";

interface State {
  date: string | null;
  area: Area | null;
  vibe: string | null;
  price: PriceBucket | null;
}

export function DiscoveryControl({ countsByDate, countsByArea, total }: { countsByDate: Record<string, number>; countsByArea: Record<Area, number>; total: number }) {
  const router = useRouter();
  const [s, setS] = useState<State>({ date: null, area: null, vibe: null, price: null });
  const [open, setOpen] = useState<Seg | null>(null);
  const [sheet, setSheet] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const href = () => {
    const parts: string[] = [];
    if (s.date) parts.push(`date=${s.date}`);
    if (s.area) parts.push(`area=${s.area}`);
    if (s.price) parts.push(`price=${s.price}`);
    const v = VIBE_OPTIONS.find((x) => x.id === s.vibe);
    if (v) parts.push(v.query);
    return `/events${parts.length ? `?${parts.join("&")}` : ""}`;
  };
  const explore = () => {
    setSheet(false);
    router.push(href());
  };

  const values: Record<Seg, string> = {
    date: s.date ? formatDay(s.date, { weekday: true }) : "Any night",
    area: s.area ? AREA_META[s.area].label : "All of NCR",
    vibe: s.vibe ? VIBE_OPTIONS.find((v) => v.id === s.vibe)!.label : "Any vibe",
    price: s.price ? PRICE_BUCKETS.find((p) => p.id === s.price)!.label : "Any price",
  };
  const LABELS: Record<Seg, string> = { date: "Date", area: "City", vibe: "Vibe", price: "Price" };

  const panels: Record<Seg, ReactNode> = {
    date: (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
        {NAVRATRI_DAYS.map((d) => {
          const p = parseDay(d.date);
          const on = s.date === d.date;
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setS({ ...s, date: on ? null : d.date });
                setOpen(null);
              }}
              className={cx(
                "flex flex-col items-center rounded-2xl border-[1.5px] px-2 py-3 transition-all",
                on ? "border-ink bg-haldi text-ink shadow-[var(--shadow-print-sm)]" : "border-ink/15 bg-card hover:border-ink",
              )}
            >
              <span className="t-label text-[0.6rem] opacity-70">{p.weekday}</span>
              <span className="font-display text-2xl font-bold tabular">{p.d}</span>
              <span className="text-[0.65rem] font-semibold text-ink-soft">{countsByDate[d.date] ?? 0} events</span>
            </button>
          );
        })}
      </div>
    ),
    area: (
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <button
            key={a}
            type="button"
            className="chip !px-4 !py-3"
            aria-pressed={s.area === a}
            onClick={() => {
              setS({ ...s, area: s.area === a ? null : a });
              setOpen(null);
            }}
          >
            {AREA_META[a].label}
            <span className="opacity-60">{countsByArea[a]}</span>
          </button>
        ))}
      </div>
    ),
    vibe: (
      <div className="grid gap-2 sm:grid-cols-2">
        {VIBE_OPTIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={s.vibe === v.id}
            onClick={() => {
              setS({ ...s, vibe: s.vibe === v.id ? null : v.id });
              setOpen(null);
            }}
            className={cx(
              "flex items-center gap-3 rounded-2xl border-[1.5px] p-3 text-left transition-all",
              s.vibe === v.id ? "border-ink bg-ink text-cream" : "border-ink/15 bg-card hover:border-ink",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border-[1.5px] border-ink" style={{ background: v.hue, color: v.ink ? "#1e1713" : "#f4ecdd" }}>
              <Icon name={v.icon} size={17} />
            </span>
            <span>
              <span className="block text-sm font-bold">{v.label}</span>
              <span className={cx("block text-xs", s.vibe === v.id ? "text-cream-dim" : "text-ink-soft")}>{v.line}</span>
            </span>
          </button>
        ))}
      </div>
    ),
    price: (
      <div className="flex flex-wrap gap-2">
        {PRICE_BUCKETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip !px-4 !py-3"
            aria-pressed={s.price === p.id}
            onClick={() => {
              setS({ ...s, price: s.price === p.id ? null : p.id });
              setOpen(null);
            }}
          >
            {p.label}
          </button>
        ))}
        <p className="t-meta mt-2 w-full text-ink-soft">Events with unconfirmed prices are left out when a price filter is on.</p>
      </div>
    ),
  };

  const segs: Seg[] = ["date", "area", "vibe", "price"];
  const hasAny = s.date || s.area || s.vibe || s.price;

  return (
    <div ref={wrap} className="relative z-20 mx-auto -mt-28 w-full max-w-[72rem] px-4 md:-mt-32 md:px-8">
      <div className="animate-rise" style={{ animationDelay: "0.75s" }}>
        <p className="t-label mb-3 inline-block rounded-full bg-ink px-3 py-1.5 text-cream">What are you looking for?</p>

        {/* Desktop: segmented search bar */}
        <div className="hidden items-stretch rounded-full border-[1.5px] border-ink bg-card p-2 text-ink shadow-[var(--shadow-print-lg)] md:flex" role="group" aria-label="Find events">
          {segs.map((seg, i) => (
            <div key={seg} className="relative flex flex-1">
              {i > 0 && <span className="my-3 w-[1.5px] bg-ink/15" aria-hidden="true" />}
              <button
                type="button"
                aria-expanded={open === seg}
                aria-controls={`dc-${seg}`}
                onClick={() => setOpen(open === seg ? null : seg)}
                className={cx(
                  "flex flex-1 flex-col items-start justify-center rounded-full px-6 py-2.5 text-left transition-colors",
                  open === seg ? "bg-paper-2" : "hover:bg-paper",
                )}
              >
                <span className="t-label text-[0.62rem] text-sindoor">{LABELS[seg]}</span>
                <span className={cx("mt-1 text-[0.95rem] font-bold", s[seg] ? "text-ink" : "text-ink-soft")}>{values[seg]}</span>
              </button>
            </div>
          ))}
          <button type="button" onClick={explore} className="btn btn-red ml-2 !px-7">
            Explore events <Icon name="arrowRight" className="btn-arrow" />
          </button>
        </div>
        {open && (
          <div
            id={`dc-${open}`}
            className="absolute inset-x-4 top-full z-30 mt-4 hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-paper p-5 text-ink shadow-[var(--shadow-print-lg)] md:inset-x-8 md:block"
            style={{ animation: "scale-in .3s var(--ease-out-expo) both", transformOrigin: "top center" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="t-label text-sindoor">{LABELS[open]}</p>
              {s[open] && (
                <button type="button" onClick={() => setS({ ...s, [open]: null })} className="text-xs font-bold text-ink-soft underline-offset-4 hover:underline">
                  Clear
                </button>
              )}
            </div>
            {panels[open]}
          </div>
        )}

        {/* Mobile: tap target that opens a bottom sheet */}
        <div className="flex items-center gap-2 rounded-[1.6rem] border-[1.5px] border-ink bg-card p-2 text-ink shadow-[var(--shadow-print)] md:hidden">
          <button type="button" onClick={() => setSheet(true)} className="flex flex-1 items-center gap-3 rounded-2xl px-3 py-2 text-left" aria-haspopup="dialog">
            <Icon name="sliders" className="shrink-0 text-sindoor" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{hasAny ? [s.date && values.date, s.area && values.area, s.vibe && values.vibe, s.price && values.price].filter(Boolean).join(" · ") : "Date · City · Vibe · Price"}</span>
              <span className="block text-xs text-ink-soft">{hasAny ? "Tap to change" : `${total} events across NCR`}</span>
            </span>
          </button>
          <button type="button" onClick={explore} className="btn btn-red !px-4 !py-3" aria-label="Explore events">
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Plan your night"
        footer={
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setS({ date: null, area: null, vibe: null, price: null })} disabled={!hasAny}>
              Clear all
            </button>
            <button type="button" className="btn btn-red flex-1" onClick={explore}>
              Explore events <Icon name="arrowRight" className="btn-arrow" />
            </button>
          </div>
        }
      >
        <div className="grid gap-7 pt-1">
          {segs.map((seg) => (
            <section key={seg} aria-label={LABELS[seg]}>
              <h3 className="t-label mb-3 text-sindoor">{LABELS[seg]}</h3>
              {seg === "date" ? (
                <div className="rail -mx-5 grid-flow-col px-5">
                  {NAVRATRI_DAYS.map((d) => {
                    const p = parseDay(d.date);
                    const on = s.date === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setS({ ...s, date: on ? null : d.date })}
                        className={cx("flex w-16 flex-col items-center rounded-2xl border-[1.5px] py-2.5 transition-all", on ? "border-ink bg-haldi text-ink" : "border-ink/15 bg-card")}
                      >
                        <span className="t-label text-[0.58rem] opacity-70">{p.weekday}</span>
                        <span className="font-display text-xl font-bold">{p.d}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                panels[seg]
              )}
            </section>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
