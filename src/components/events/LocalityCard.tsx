import Link from "next/link";
import { AREA_META } from "@/lib/constants";
import type { AreaSummary } from "@/lib/discovery";
import { cx } from "@/lib/format";
import type { Area } from "@/lib/types";
import { GarbaRing } from "../art/Motifs";
import { Icon } from "../ui/Icon";

/** Each city gets its own dye, like a block-printed swatch. */
export const AREA_HUE: Record<Area, { bg: string; ink: boolean; ring: string }> = {
  delhi: { bg: "#bd1f1a", ink: false, ring: "#f3b61f" },
  dwarka: { bg: "#f3b61f", ink: true, ring: "#bd1f1a" },
  noida: { bg: "#1f2f6d", ink: false, ring: "#f3b61f" },
  gurugram: { bg: "#1e1713", ink: false, ring: "#e46f1a" },
  ghaziabad: { bg: "#3c6a32", ink: false, ring: "#f3b61f" },
};

export function LocalityCard({ summary, size = "md", className }: { summary: AreaSummary; size?: "md" | "lg"; className?: string }) {
  const meta = AREA_META[summary.area];
  const hue = AREA_HUE[summary.area];
  return (
    <article
      className={cx(
        "lift group relative isolate flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink p-6 md:p-7",
        hue.ink ? "text-ink" : "on-color text-cream",
        size === "lg" && "md:p-9",
        className,
      )}
      style={{ background: hue.bg }}
    >
      <div aria-hidden="true" className="bandhani absolute inset-0 -z-10 opacity-80" style={{ "--dot": hue.ink ? "rgb(30 23 19 / 0.13)" : "rgb(244 236 221 / 0.13)", "--gap": "16px" } as React.CSSProperties} />
      <GarbaRing
        className={cx("absolute -right-12 -top-12 -z-10 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:rotate-90", size === "lg" ? "size-80" : "size-48")}
        color={hue.ring}
        count={size === "lg" ? 36 : 24}
      />
      <div className="flex items-center justify-between">
        <span className={cx("t-label rounded-full border-[1.5px] px-2.5 py-1.5", hue.ink ? "border-ink" : "border-cream/60")}>{meta.short}</span>
        <span className="t-meta font-extrabold tabular">
          {summary.count} event{summary.count === 1 ? "" : "s"}
        </span>
      </div>
      <h3 className={cx("t-display mt-auto pt-10 !leading-[0.85]", size === "lg" ? "!text-[clamp(3.5rem,8vw,7.5rem)]" : "!text-[clamp(2.6rem,4.4vw,3.9rem)]")}>
        <Link href={`/events?area=${summary.area}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {meta.label}
        </Link>
      </h3>
      <p className="t-serif mt-3 text-lg leading-snug md:text-xl">{meta.blurb}</p>
      {summary.localities.length > 0 && (
        <ul className="relative z-10 mt-5 flex flex-wrap gap-1.5" aria-label={`Localities in ${meta.label}`}>
          {summary.localities.slice(0, size === "lg" ? 5 : 3).map((l) => (
            <li key={l.name}>
              <Link
                href={`/events?area=${summary.area}&locality=${encodeURIComponent(l.name)}`}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-xs font-bold transition-colors",
                  hue.ink ? "border-ink/30 hover:border-ink hover:bg-ink hover:text-haldi" : "border-cream/35 hover:border-cream hover:bg-cream hover:text-ink",
                )}
              >
                {l.name}
                <span className="opacity-60">{l.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Icon name="arrowUpRight" className="absolute bottom-6 right-6 opacity-70 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 md:bottom-7 md:right-7" size={22} />
    </article>
  );
}
