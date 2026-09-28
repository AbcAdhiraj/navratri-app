"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/format";

export interface SegOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Radio-group segmented control with a sliding, width-morphing selection pill. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  tone = "paper",
  size = "md",
  className,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  tone?: "paper" | "dark";
  size?: "sm" | "md";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`);
      if (el) setInd({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [value, options.length]);

  const onKey = (e: KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + options.length) % options.length;
    if (n >= 0) {
      e.preventDefault();
      onChange(options[n].value);
      ref.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[n].value)}"]`)?.focus();
    }
  };

  const dark = tone === "dark";
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={cx(
        "no-scrollbar relative inline-flex max-w-full overflow-x-auto rounded-full p-1",
        dark ? "border-[1.5px] border-cream/25" : "border-[1.5px] border-ink/15 bg-card",
        className,
      )}
    >
      {ind && (
        <span
          aria-hidden="true"
          className={cx(
            "absolute bottom-1 left-0 top-1 rounded-full transition-[transform,width] duration-500 ease-[var(--ease-out-expo)]",
            dark ? "bg-haldi" : "bg-ink",
          )}
          style={{ transform: `translateX(${ind.x}px)`, width: ind.w }}
        />
      )}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            data-value={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              "relative z-10 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition-colors duration-300",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-[0.8125rem]",
              on ? (dark ? "text-ink" : "text-cream") : dark ? "text-cream-dim hover:text-cream" : "text-ink-soft hover:text-ink",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cx("tabular text-[0.7em]", on ? "opacity-70" : "opacity-50")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
