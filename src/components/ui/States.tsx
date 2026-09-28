import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { GarbaRing } from "../art/Motifs";
import { Rangoli } from "../art/Rangoli";
import { RetryButton } from "./RetryButton";

export function EmptyState({
  title = "Nothing found for this combination.",
  body = "Try another date, locality or vibe.",
  action,
  className,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("relative flex flex-col items-center overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-dashed border-ink/25 bg-card/60 px-6 py-16 text-center md:py-24", className)}
      style={{ animation: "rise .6s var(--ease-out-expo) both" }}
    >
      <div className="relative size-28">
        <GarbaRing className="absolute inset-0 text-sindoor motion-safe:animate-spin-slow" count={20} />
        <div className="absolute inset-7">
          <Rangoli seed={5} size={200} rings={3} colors={["#bd1f1a", "#f3b61f", "#1f2f6d"]} strokeWidth={1.4} />
        </div>
      </div>
      <p className="t-h3 mt-6 text-balance">{title}</p>
      <p className="t-body mt-2 max-w-md text-ink-soft">{body}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went sideways.", body = "We couldn’t load these events right now." }: { title?: string; body?: string }) {
  return (
    <EmptyState
      title={title}
      body={body}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <RetryButton />
          <Link href="/" className="btn btn-outline btn-sm">
            Back home
          </Link>
        </div>
      }
    />
  );
}

/* ───────── Skeletons ───────── */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cx("overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink/10 bg-card", className)} aria-hidden="true">
      <div className="skeleton aspect-[4/3] !rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 px-3 py-3" aria-hidden="true">
      <div className="skeleton h-14 !rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      <div className="skeleton h-4 w-16" />
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="skeleton h-10 w-24 shrink-0 !rounded-full" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[70svh] overflow-hidden bg-sindoor px-4 pt-32 md:px-12 on-color" aria-hidden="true">
      <div className="skeleton h-3 w-48" />
      <div className="skeleton mt-8 h-20 w-3/4 md:h-36" />
      <div className="skeleton mt-4 h-20 w-1/2 md:h-36" />
      <div className="skeleton mt-10 h-4 w-80 max-w-full" />
    </div>
  );
}
