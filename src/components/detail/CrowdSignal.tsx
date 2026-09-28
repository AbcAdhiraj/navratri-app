import type { EventRecord } from "@/lib/types";
import { Icon } from "../ui/Icon";

/**
 * Optional crowd-perception signal. Shown only from aggregated human reports about this event
 * (or a clearly identified previous edition). Never inferred from images or appearance.
 */
export function CrowdSignal({ event: e }: { event: EventRecord }) {
  const c = e.crowd;
  if (!c) {
    return (
      <div className="flex items-start gap-4 rounded-[var(--radius-card)] border-[1.5px] border-dashed border-ink/25 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-ink/40 text-ink-faint">
          <Icon name="users" size={18} />
        </span>
        <div>
          <p className="font-bold">No reliable crowd estimate yet.</p>
          <p className="t-meta mt-1 text-ink-soft">We only show a crowd impression once enough people who attended this event have reported one.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[var(--radius-card)] border-[1.5px] border-ink bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="t-label text-ink-soft">Crowd-reported impression</p>
        <span className="tag border-[1.5px] border-dashed border-sindoor text-sindoor">Not verified for tonight</span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Roughly {c.womenPctLow}–{c.womenPctHigh}% women
      </p>
      <div className="relative mt-5 h-4 rounded-full border-[1.5px] border-ink bg-paper-2" role="img" aria-label={`Reported range ${c.womenPctLow} to ${c.womenPctHigh} percent women`}>
        <div className="absolute inset-y-0 rounded-full bg-haldi [background-image:repeating-linear-gradient(135deg,transparent_0_5px,rgb(30_23_19/.18)_5px_7px)]" style={{ left: `${c.womenPctLow}%`, width: `${c.womenPctHigh - c.womenPctLow}%` }} />
        <div className="absolute inset-y-[-5px] left-1/2 w-[1.5px] bg-ink/50" aria-hidden="true" />
      </div>
      <div className="mt-1.5 flex justify-between text-[0.65rem] font-bold text-ink-faint" aria-hidden="true">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <p className="t-meta mt-4 text-ink-soft">
        <b className="text-ink">{c.editionLabel}</b> · {c.reportCount} report{c.reportCount === 1 ? "" : "s"} from attendees. A perception, not a measurement — never inferred from photos.
      </p>
    </div>
  );
}
