import type { Section } from "@/lib/discovery";
import { cx } from "@/lib/format";
import { EventCard } from "../events/cards";
import { EventCarousel } from "../events/EventCarousel";
import { SectionHeader } from "./SectionHeader";

const TONES = {
  paper: "bg-paper",
  paper2: "bg-paper-2",
  ink: "on-dark bg-ink",
} as const;

/** Editorial rail: header + horizontally scrolling standard cards. */
export function RailSection({ section, tone = "paper" }: { section: Section; tone?: keyof typeof TONES }) {
  const dark = tone === "ink";
  return (
    <section aria-labelledby={`${section.id}-title`} className={cx("grain relative overflow-hidden py-20 md:py-28", TONES[tone])}>
      {dark && <div aria-hidden="true" className="bandhani absolute inset-0 opacity-60" style={{ "--dot": "rgb(244 236 221 / 0.07)", "--gap": "18px" } as React.CSSProperties} />}
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <SectionHeader
          id={`${section.id}-title`}
          kicker={section.kicker}
          title={section.title}
          blurb={section.blurb}
          href={section.href}
          accentClass={dark ? "text-haldi" : "text-sindoor"}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-[90rem]">
        <EventCarousel label={section.kicker} tone={dark ? "dark" : "paper"} itemClassName="w-[74vw] sm:w-[19rem] lg:w-[20.5rem]">
          {section.events.slice(0, 10).map((e) => (
            <EventCard key={e.slug} event={e} className="h-full" />
          ))}
        </EventCarousel>
      </div>
    </section>
  );
}
