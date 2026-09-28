import Link from "next/link";
import { SOURCE_KIND_META } from "@/lib/constants";
import { cx, relativeChecked } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { Icon } from "../ui/Icon";

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={cx("grid size-6 place-items-center rounded-full border-[1.5px]", ok ? "border-ink bg-mehendi text-cream" : "border-dashed border-ink/35 text-ink-faint")}>
        <Icon name={ok ? "check" : "x"} size={12} strokeWidth={3} />
      </span>
      <span className={cx("text-sm font-semibold", !ok && "text-ink-faint")}>
        {label}
        {!ok && " — not yet"}
      </span>
    </li>
  );
}

/** Trust layer: what's been checked, against which sources, and when. */
export function TrustPanel({ event: e }: { event: EventRecord }) {
  const v = e.verification;
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink bg-mehendi-soft p-5 md:p-6">
        <p className="t-label flex items-center gap-2 text-mehendi">
          <Icon name="shield" size={15} /> Verified information
        </p>
        <ul className="mt-4 grid gap-2.5">
          <Check ok={v.dateChecked} label="Date checked" />
          <Check ok={v.priceChecked} label="Price checked" />
          <Check ok={v.entryChecked} label="Entry policy checked" />
          <Check ok={!!e.booking?.verified} label="Booking link checked" />
        </ul>
        <p className="t-meta mt-5 border-t-[1.5px] border-dashed border-ink/20 pt-4 text-ink-soft">
          Last checked <b className="text-ink">{relativeChecked(v.lastCheckedAt)}</b>
        </p>
        <span aria-hidden="true" className="absolute -right-3 top-4 rotate-[-8deg] rounded-md border-2 border-mehendi px-2 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-mehendi" style={{ animation: "stamp .6s var(--ease-out-expo) .3s both" }}>
          Checked
        </span>
      </div>
      <div className="rounded-[var(--radius-card)] border-[1.5px] border-ink/15 bg-card p-5 md:p-6">
        <p className="t-label text-ink-soft">Sources</p>
        {e.sources.length === 0 ? (
          <p className="t-meta mt-3 text-ink-soft">No public sources recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y-[1.5px] divide-dashed divide-ink/10">
            {e.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="group flex items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-haldi text-ink">
                    <Icon name="link" size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold group-hover:underline">{s.label}</span>
                    <span className="t-meta block text-ink-faint">
                      {SOURCE_KIND_META[s.kind]} · checked {relativeChecked(s.checkedAt)}
                    </span>
                  </span>
                  <Icon name="external" size={15} className="shrink-0 text-ink-faint" />
                </a>
              </li>
            ))}
          </ul>
        )}
        <Link href="/methodology" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sindoor hover:underline">
          How we verify <Icon name="arrowRight" size={13} />
        </Link>
      </div>
    </div>
  );
}
