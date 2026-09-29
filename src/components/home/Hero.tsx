import { PosterArt } from "../art/PosterArt";
import { Rangoli } from "../art/Rangoli";
import { GarbaRing, Sparkle, Torana } from "../art/Motifs";
import { EventTitle } from "../events/bits";
import { NAVRATRI_DAYS } from "@/lib/constants";
import { daysBetween, formatDay, priceLabel, todayIST } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

function statusLine(now = new Date()) {
  const today = todayIST(now);
  const start = NAVRATRI_DAYS[0].date;
  const end = NAVRATRI_DAYS[NAVRATRI_DAYS.length - 1].date;
  if (today < start) {
    const n = daysBetween(today, start);
    return { live: false, text: n === 1 ? "Navratri begins tomorrow" : `Navratri begins in ${n} days`, sub: formatDay(start, { weekday: true }) };
  }
  if (today <= end) {
    const night = NAVRATRI_DAYS.find((d) => d.date === today)!.night;
    return { live: true, text: `Night ${night} of 9 is on`, sub: "Tonight" };
  }
  return { live: false, text: "That’s a wrap for 2026", sub: "See you next Navratri" };
}

const POSTERS = [
  { pos: "right-[6%] top-[15%] w-[14.5rem]", r: "5deg", delay: "0s" },
  { pos: "right-[23%] top-[37%] w-[12.5rem]", r: "-7deg", delay: "-3s" },
  { pos: "right-[4%] top-[55%] w-[11.5rem]", r: "3deg", delay: "-6s" },
];

export function Hero({ events, posters }: { events: EventRecord[]; posters: EventRecord[] }) {
  const status = statusLine();
  const areas = new Set(events.map((e) => e.venue.area)).size;

  return (
    <section aria-labelledby="hero-title" className="on-color relative isolate flex min-h-[88svh] flex-col overflow-hidden bg-sindoor pb-36 pt-28 md:min-h-[min(100svh,62rem)] md:pb-44 md:pt-32">
      {/* 1 · printed texture */}
      <div aria-hidden="true" className="bandhani absolute inset-0 -z-10" style={{ "--dot": "rgb(147 22 15 / 0.75)", "--gap": "18px" } as React.CSSProperties} />
      <Torana aria-hidden="true" className="absolute inset-x-0 top-[var(--nav-h)] -z-10 h-9 w-full text-ink/70" count={40} />

      {/* 2 · rangoli stamp (tone-on-tone) */}
      <div aria-hidden="true" className="absolute -right-[70%] top-[46%] -z-10 w-[44rem] max-w-none opacity-60 md:-right-[20%] md:top-[2%] md:w-[66rem] md:opacity-100 lg:-right-[10%]" data-parallax style={{ "--p": 0.16 } as React.CSSProperties}>
        <div className="animate-fade [animation-duration:1.8s]">
          <div className="motion-safe:animate-spin-slow">
            <Rangoli seed={11} size={400} rings={7} colors={["#f3b61f", "#93160f", "#f4ecdd", "#93160f"]} strokeWidth={0.9} opacity={0.9} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute -bottom-40 -left-40 -z-10 w-[30rem] text-haldi/60" data-parallax style={{ "--p": 0.08 } as React.CSSProperties}>
        <GarbaRing className="w-full motion-safe:animate-spin-slower" count={48} />
      </div>
      <Sparkle className="absolute left-[44%] top-[24%] -z-10 size-5 text-haldi motion-safe:animate-float" />
      <Sparkle className="absolute left-[7%] top-[33%] -z-10 size-3 text-cream motion-safe:animate-float [animation-delay:-4s]" />

      {/* 3 · floating posters (desktop) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden xl:block" data-parallax style={{ "--p": -0.05 } as React.CSSProperties}>
        {posters.slice(0, 3).map((e, i) => (
          <div key={e.slug} className={`absolute ${POSTERS[i].pos} animate-fade [animation-duration:1.4s]`} style={{ animationDelay: `${0.45 + i * 0.2}s` }}>
            <div className="motion-safe:animate-float" style={{ "--r": POSTERS[i].r, transform: `rotate(${POSTERS[i].r})`, animationDelay: POSTERS[i].delay } as React.CSSProperties}>
              <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-card text-ink shadow-[var(--shadow-print-lg)]">
                <div className="relative aspect-[4/3.4] border-b-[1.5px] border-ink">
                  <PosterArt seed={e.slug} type={e.types[0]} density="light" />
                </div>
                <div className="relative border-t-2 border-dashed border-ink/25 p-3.5">
                  <p className="t-label text-sindoor">{formatDay(e.occurrences[0].date, { weekday: true })}</p>
                  <p className="mt-1.5 font-display text-[0.95rem] font-bold leading-tight">
                    <EventTitle event={e} />
                  </p>
                  <p className="t-meta mt-1 text-ink-soft">{priceLabel(e.price)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4 · typography */}
      <div className="relative mx-auto w-full max-w-[90rem] flex-1 px-4 pt-8 md:px-8 md:pt-10 lg:px-12">
        <p className="kicker animate-rise !text-cream" style={{ animationDelay: "0.05s" }}>
          Sharad Navratri · 11–19 Oct 2026
        </p>
        <h1 id="hero-title" className="t-display mt-6 text-cream md:mt-8">
          <span className="block animate-rise" style={{ animationDelay: "0.12s" }}>
            NCR,
          </span>
          <span className="t-serif ml-[0.55em] block animate-rise text-[0.6em] leading-[0.95] text-haldi md:ml-[1.3em]" style={{ animationDelay: "0.26s" }}>
            let’s
          </span>
          <span className="block animate-rise pb-[0.05em] text-haldi [text-shadow:0.045em_0.045em_0_var(--color-ink)]" style={{ animationDelay: "0.4s" }}>
            Garba.
          </span>
        </h1>
        <div className="mt-8 flex max-w-xl animate-rise flex-col gap-6 md:mt-10" style={{ animationDelay: "0.6s" }}>
          <p className="text-lg font-medium leading-relaxed text-cream md:text-xl">
            Garba, dandiya, Bollywood and DJ nights across Delhi NCR, Mumbai, Pune &amp; Bangalore — with dates, prices and entry rules checked at the source.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-ink bg-ink py-2 pl-2.5 pr-4 text-sm font-bold text-cream">
              <span className="relative flex size-2.5">
                {status.live && <span className="absolute inset-0 animate-ping rounded-full bg-haldi opacity-70" />}
                <span className="relative size-2.5 rounded-full bg-haldi" />
              </span>
              {status.text}
              <span className="font-medium text-cream-faint">· {status.sub}</span>
            </span>
            <span className="t-meta text-cream">
              <b className="font-extrabold text-cream tabular">{events.length}</b> events · <b className="font-extrabold text-cream">{areas}</b> cities
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
