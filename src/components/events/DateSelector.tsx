"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { NAVRATRI_DAYS } from "@/lib/constants";
import { cx, parseDay } from "@/lib/format";

interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  counts?: Record<string, number>;
  today?: string | null;
  /** id of the panel the tabs control */
  controls?: string;
  className?: string;
}

/**
 * The nine nights as calendar leaves. A haldi-yellow "stamp" slides and resizes to the
 * selected night; arrow keys move between nights.
 */
export function DateSelector({ value, onChange, counts, today, controls, className }: DateSelectorProps) {
  const list = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);
  const days = NAVRATRI_DAYS;

  useLayoutEffect(() => {
    const el = list.current?.querySelector<HTMLButtonElement>(`[data-date="${value}"]`);
    if (!el || !list.current) return;
    setInd({ x: el.offsetLeft, w: el.offsetWidth });
    const box = list.current;
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2, behavior: ind ? "smooth" : "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = days.findIndex((d) => d.date === value);
    let next = -1;
    if (e.key === "ArrowRight") next = Math.min(days.length - 1, i + 1);
    if (e.key === "ArrowLeft") next = Math.max(0, i - 1);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = days.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(days[next].date);
      list.current?.querySelector<HTMLButtonElement>(`[data-date="${days[next].date}"]`)?.focus();
    }
  };

  return (
    <div
      ref={list}
      role="tablist"
      aria-label="Choose a night"
      onKeyDown={onKey}
      className={cx("no-scrollbar relative flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-3 pt-2", className)}
    >
      {ind && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-2 h-[calc(100%-1.25rem)] rounded-2xl border-[1.5px] border-ink bg-haldi shadow-[var(--shadow-print-sm)] transition-[transform,width] duration-500 ease-[var(--ease-out-expo)]"
          style={{ transform: `translateX(${ind.x}px)`, width: ind.w }}
        />
      )}
      {days.map((d) => {
        const on = d.date === value;
        const p = parseDay(d.date);
        const n = counts?.[d.date];
        const isToday = today === d.date;
        return (
          <button
            key={d.date}
            type="button"
            role="tab"
            data-date={d.date}
            aria-selected={on}
            aria-controls={controls}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(d.date)}
            className={cx(
              "relative z-10 flex min-w-[4.4rem] flex-1 shrink-0 snap-center flex-col items-center rounded-2xl border-[1.5px] px-2 pb-2.5 pt-2.5 transition-colors duration-300 md:min-w-[5.25rem] md:pt-3",
              on ? "border-transparent text-ink" : "border-ink/15 bg-card text-ink hover:border-ink",
            )}
          >
            <span className={cx("t-label text-[0.6rem]", isToday && !on ? "text-sindoor" : "text-ink-soft")}>{isToday ? "Today" : p.weekday}</span>
            <span className="font-display text-[1.7rem] font-bold leading-none tracking-tight tabular md:text-3xl">{p.d}</span>
            <span className="mt-1 text-[0.6rem] font-extrabold uppercase tracking-wider text-ink-soft">Night {d.night}</span>
            {n !== undefined && (
              <span
                className={cx("mt-1.5 min-w-5 rounded-full px-1.5 text-[0.62rem] font-extrabold leading-4 tabular", on ? "bg-ink text-haldi" : "bg-ink/[0.07]", n === 0 && "opacity-40")}
                aria-label={`${n} events`}
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
