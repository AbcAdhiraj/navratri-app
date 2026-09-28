import { cx } from "@/lib/format";
import { Torana } from "../art/Motifs";

const TONES = {
  sindoor: "on-color bg-sindoor",
  neel: "on-dark bg-neel",
  haldi: "bg-haldi text-ink",
  ink: "on-dark bg-ink",
  paper: "bg-paper-2 text-ink",
};

export function PageHeader({ kicker, title, accent, lead, tone = "neel" }: { kicker: string; title: string; accent?: string; lead?: string; tone?: keyof typeof TONES }) {
  const light = tone === "haldi" || tone === "paper";
  return (
    <header className={cx("relative overflow-hidden pb-14 pt-[calc(var(--nav-h)+3.5rem)] md:pb-20", TONES[tone])}>
      <div
        aria-hidden="true"
        className="bandhani absolute inset-0"
        style={{ "--dot": light ? "rgb(30 23 19 / 0.12)" : "rgb(244 236 221 / 0.12)", "--gap": "18px" } as React.CSSProperties}
      />
      <Torana aria-hidden="true" className={cx("absolute inset-x-0 top-[var(--nav-h)] h-9 w-full", light ? "text-ink/60" : "text-cream/60")} count={40} />
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <p className={cx("kicker", light && "!text-ink")}>{kicker}</p>
        <h1 className="t-h1 mt-5 max-w-4xl text-balance">
          {title}
          {accent && <span className={cx("t-serif", light ? "text-sindoor" : "text-haldi")}> {accent}</span>}
        </h1>
        {lead && <p className={cx("t-body mt-4 max-w-2xl text-lg", light ? "text-ink-soft" : tone === "sindoor" ? "text-cream" : "text-cream-dim")}>{lead}</p>}
      </div>
    </header>
  );
}
