import Link from "next/link";
import { applyFilters, parseFilters } from "@/lib/discovery";
import type { EventRecord } from "@/lib/types";
import { VIBE_OPTIONS } from "@/lib/vibes";
import { DandiyaPair } from "../art/Motifs";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "./SectionHeader";

/** Flat, dyed tiles — each vibe maps to real, filterable facts. */
export function VibeGrid({ events }: { events: EventRecord[] }) {
  const vibes = VIBE_OPTIONS.map((v) => ({ ...v, count: applyFilters(events, parseFilters(new URLSearchParams(v.query))).length })).filter((v) => v.count > 0);
  if (vibes.length < 3) return null;
  // Let the final tile absorb any leftover cells so the mosaic always closes cleanly.
  const cells = 4 + (vibes.length - 1);
  const mdLeft = (5 - (cells % 5)) % 5;
  const smLeft = cells % 2;
  const lastSpan = [smLeft ? "col-span-2" : "", ["", "md:col-span-2", "md:col-span-3", "md:col-span-4", "md:col-span-5"][mdLeft]].join(" ");

  return (
    <section aria-labelledby="vibe-title" className="grain relative overflow-hidden bg-paper-2 py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <SectionHeader id="vibe-title" kicker="Find your vibe" title="Same festival," accent="nine different nights." blurb="Every vibe below maps to confirmed details — music listed by the organizer, entry rules they’ve published." />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {vibes.map((v, i) => (
            <li key={v.id} data-reveal style={{ "--i": i } as React.CSSProperties} className={i === 0 ? "col-span-2 row-span-2" : i === vibes.length - 1 ? lastSpan : undefined}>
              <Link
                href={`/events?${v.query}`}
                className="lift group relative flex h-full min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink p-5 md:p-6"
                style={{ background: v.hue, color: v.ink ? "var(--color-ink)" : "var(--color-cream)" }}
              >
                <span
                  aria-hidden="true"
                  className="bandhani absolute inset-0 opacity-70"
                  style={{ "--dot": v.ink ? "rgb(30 23 19 / 0.14)" : "rgb(244 236 221 / 0.16)", "--gap": "15px" } as React.CSSProperties}
                />
                <span className="relative flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-current">
                    <Icon name={v.icon} size={19} />
                  </span>
                  <span className="rounded-full bg-ink px-2.5 py-1 font-display text-sm font-bold tabular text-cream">{v.count}</span>
                </span>
                {i === 0 && <DandiyaPair className="relative my-6 size-28 self-center transition-transform duration-700 group-hover:rotate-12 md:size-40" />}
                <span className="relative">
                  <span className={`block font-display font-bold leading-tight tracking-tight ${i === 0 ? "text-3xl md:text-5xl" : "text-lg md:text-xl"}`}>{v.label}</span>
                  <span className="mt-1 block text-sm font-medium">{v.line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
