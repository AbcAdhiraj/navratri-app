import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { Icon, type IconName } from "../ui/Icon";

export function InfoBlock({ icon, label, children, muted = false, className }: { icon: IconName; label: string; children: ReactNode; muted?: boolean; className?: string }) {
  return (
    <div className={cx("relative rounded-[var(--radius-card)] border-[1.5px] border-ink/15 bg-card p-5 transition-colors hover:border-ink", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full border-[1.5px] border-ink bg-haldi text-ink">
          <Icon name={icon} size={15} />
        </span>
        <h3 className="t-label text-ink-soft">{label}</h3>
      </div>
      <div className={cx("mt-4 font-display text-lg font-bold leading-snug tracking-tight md:text-xl", muted && "font-sans !text-base !font-semibold text-ink-faint")}>{children}</div>
    </div>
  );
}

export function TriIcon({ value }: { value: boolean | null }) {
  if (value === true)
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-mehendi text-cream" role="img" aria-label="Confirmed yes">
        <Icon name="check" size={13} strokeWidth={3} />
      </span>
    );
  if (value === false)
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-sindoor text-cream" role="img" aria-label="Confirmed no">
        <Icon name="x" size={13} strokeWidth={3} />
      </span>
    );
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-ink/40 text-xs font-extrabold text-ink-faint" role="img" aria-label="Not confirmed">
      ?
    </span>
  );
}

export function DetailSection({ id, kicker, title, children, className }: { id: string; kicker: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={`${id}-title`} className={cx("border-t-[1.5px] border-dashed border-ink/20 py-10 md:py-12", className)} data-reveal>
      <p className="kicker">{kicker}</p>
      <h2 id={`${id}-title`} className="t-h2 mt-3 !text-[clamp(1.7rem,3vw,2.4rem)]">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
