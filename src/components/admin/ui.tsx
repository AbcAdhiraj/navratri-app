import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import type { EventStatus, SubmissionStatus } from "@/lib/types";

const STATUS: Record<EventStatus | SubmissionStatus, string> = {
  published: "bg-mehendi text-cream",
  draft: "bg-paper-3 text-ink",
  cancelled: "bg-sindoor text-cream",
  archived: "bg-ink-faint text-cream",
  pending: "bg-haldi text-ink",
  approved: "bg-mehendi text-cream",
  rejected: "bg-sindoor text-cream",
  duplicate: "bg-neel text-cream",
};

export function StatusBadge({ status }: { status: EventStatus | SubmissionStatus }) {
  return <span className={cx("inline-flex rounded-md px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider", STATUS[status])}>{status}</span>;
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-2xl border-[1.5px] border-ink/15 bg-card", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink/10 px-5 py-3.5">
          {title && <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, tone = "paper" }: { label: string; value: number | string; tone?: "paper" | "haldi" | "sindoor" }) {
  return (
    <div className={cx("rounded-2xl border-[1.5px] border-ink p-5", tone === "haldi" && "bg-haldi", tone === "sindoor" && "bg-sindoor text-cream", tone === "paper" && "bg-card")}>
      <p className="t-label opacity-70">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold tabular">{value}</p>
    </div>
  );
}

export function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
