import Image from "next/image";
import type { Media } from "@/lib/types";

/** Authorised images only. Desktop: lead + secondary grid. Mobile: swipeable rail. */
export function Gallery({ media }: { media: Media[] }) {
  if (media.length < 2) return null;
  const [lead, ...rest] = media;
  const caption = (m: Media) => [m.credit && `Photo: ${m.credit}`, m.year && `${m.year} edition`].filter(Boolean).join(" · ");
  return (
    <>
      <div className="rail -mx-4 px-4 md:hidden" role="region" aria-label="Event photos" tabIndex={0}>
        {media.map((m) => (
          <figure key={m.id} className="w-[82vw]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink">
              <Image src={m.url} alt={m.alt} fill sizes="82vw" className="object-cover" />
            </div>
            {caption(m) && <figcaption className="t-meta mt-2 text-ink-faint">{caption(m)}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="hidden gap-3 md:grid md:grid-cols-3 md:grid-rows-2">
        <figure className="relative col-span-2 row-span-2">
          <div className="relative h-full min-h-[22rem] overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink">
            <Image src={lead.url} alt={lead.alt} fill sizes="60vw" className="object-cover" />
          </div>
          {caption(lead) && <figcaption className="t-meta mt-2 text-ink-faint">{caption(lead)}</figcaption>}
        </figure>
        {rest.slice(0, 2).map((m) => (
          <figure key={m.id}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink">
              <Image src={m.url} alt={m.alt} fill sizes="30vw" className="object-cover" />
            </div>
            {caption(m) && <figcaption className="t-meta mt-2 text-ink-faint">{caption(m)}</figcaption>}
          </figure>
        ))}
      </div>
    </>
  );
}
