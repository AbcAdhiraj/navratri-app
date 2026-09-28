"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { Icon } from "../ui/Icon";

/** Scroll-snap rail with desktop arrow controls. Content stays server-rendered. */
export function EventCarousel({
  children,
  label,
  itemClassName = "w-[78vw] sm:w-[20rem]",
  tone = "paper",
  className,
}: {
  children: ReactNode;
  label: string;
  itemClassName?: string;
  tone?: "dark" | "paper";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const btn = cx(
    "icon-btn size-11 disabled:opacity-30 disabled:pointer-events-none",
    tone === "dark" ? "border-[1.5px] border-cream/40 text-cream hover:border-cream" : "border-[1.5px] border-ink bg-card text-ink hover:bg-haldi",
  );

  return (
    <div className={cx("relative", className)}>
      <div className="pointer-events-none absolute -top-16 right-4 hidden gap-2 md:flex md:right-8 lg:right-12">
        <button type="button" className={cx(btn, "pointer-events-auto")} onClick={() => go(-1)} disabled={edge.start} aria-label={`Scroll ${label} back`}>
          <Icon name="chevronLeft" />
        </button>
        <button type="button" className={cx(btn, "pointer-events-auto")} onClick={() => go(1)} disabled={edge.end} aria-label={`Scroll ${label} forward`}>
          <Icon name="chevronRight" />
        </button>
      </div>
      <div
        ref={ref}
        className="rail scroll-px-4 px-4 pb-6 pt-1 md:scroll-px-8 md:px-8 lg:scroll-px-12 lg:px-12"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {Children.map(children, (c, i) => (
          <div className={itemClassName} data-reveal style={{ "--i": Math.min(i, 5) } as React.CSSProperties}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
