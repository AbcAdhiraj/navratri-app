import { cx, formatDateRange, priceLabel, relativeChecked } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { BookmarkButton, ShareButton } from "../events/actions";
import { Icon } from "../ui/Icon";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Desktop sticky panel. The booking CTA only exists when a verified external link exists. */
export function BookingPanel({ event: e }: { event: EventRecord }) {
  const verified = e.booking?.verified ? e.booking : null;
  const source = e.sources[0];
  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card shadow-[var(--shadow-print-lg)]">
      <div className="bg-ink p-6 text-cream">
        <p className="t-label text-haldi">{e.price.status === "paid" ? "Tickets from" : "Entry"}</p>
        <p className={cx("mt-2 font-display font-bold leading-none tracking-tight", e.price.status === "unknown" ? "text-2xl text-cream-dim" : "text-[2.6rem]")}>{priceLabel(e.price)}</p>
        {e.price.maxInr != null && e.price.maxInr !== e.price.minInr && <p className="t-meta mt-2 text-cream-dim">Up to ₹{e.price.maxInr.toLocaleString("en-IN")} for higher tiers</p>}
        <p className="t-meta mt-3 text-cream-dim">{formatDateRange(e.occurrences)}</p>
      </div>
      <div className="p-6">
        {verified ? (
          <>
            <a href={verified.url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-red w-full !py-4 text-sm">
              Book tickets <Icon name="external" size={16} />
            </a>
            <p className="t-meta mt-3 flex items-center gap-1.5 text-ink-soft">
              <Icon name="shield" size={14} className="text-mehendi" />
              Verified link · {verified.platform} ({hostOf(verified.url)})
            </p>
            <p className="mt-1 text-xs text-ink-faint">You’ll book on the organizer’s platform — we never sell tickets.</p>
          </>
        ) : (
          <div className="rounded-2xl border-[1.5px] border-dashed border-ink/25 p-4">
            <p className="font-bold">{e.price.status === "free" ? "Free entry — no ticket listed" : "No verified booking link yet"}</p>
            <p className="t-meta mt-1 text-ink-soft">
              {e.price.status === "free" ? "Confirm timings with the organizer before you go." : "We only show a booking button once we’ve checked the link is the organizer’s own."}
            </p>
            {source && (
              <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sindoor hover:underline">
                View source: {source.label} <Icon name="external" size={14} />
              </a>
            )}
          </div>
        )}
        <div className="mt-5 flex items-center gap-2 border-t-[1.5px] border-dashed border-ink/15 pt-5">
          <BookmarkButton slug={e.slug} title={e.title} tone="paper" />
          <ShareButton path={`/events/${e.slug}`} title={e.title} tone="paper" />
          <span className="ml-auto text-right text-xs text-ink-faint">
            Checked
            <br />
            <b className="text-ink-soft">{relativeChecked(e.verification.lastCheckedAt)}</b>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Mobile sticky bottom bar. */
export function MobileBookingBar({ event: e }: { event: EventRecord }) {
  const verified = e.booking?.verified ? e.booking : null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t-[1.5px] border-ink bg-card px-4 pt-3 lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="t-label text-[0.6rem] text-ink-soft">{e.price.status === "paid" ? "Tickets from" : "Entry"}</p>
          <p className={cx("truncate font-display font-bold", e.price.status === "unknown" ? "text-base text-ink-faint" : "text-xl")}>{priceLabel(e.price)}</p>
        </div>
        {verified ? (
          <a href={verified.url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-red !px-5">
            Book tickets <Icon name="external" size={15} />
          </a>
        ) : (
          <>
            <BookmarkButton slug={e.slug} title={e.title} tone="paper" />
            <ShareButton path={`/events/${e.slug}`} title={e.title} tone="paper" />
          </>
        )}
      </div>
    </div>
  );
}
