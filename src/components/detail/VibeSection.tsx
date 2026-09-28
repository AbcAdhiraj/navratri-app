import { VIBE_META } from "@/lib/constants";
import type { EventRecord, VibeTag } from "@/lib/types";
import { Icon } from "../ui/Icon";

const HUE: Record<VibeTag, { bg: string; ink?: boolean }> = {
  traditional_garba: { bg: "#bd1f1a" },
  bollywood_mix: { bg: "#c81e68" },
  dandiya_night: { bg: "#1f2f6d" },
  late_night: { bg: "#1e1713" },
  dj_night: { bg: "#e46f1a", ink: true },
  live_music: { bg: "#f3b61f", ink: true },
  family_friendly: { bg: "#3c6a32" },
  large_scale: { bg: "#93160f" },
};

/** "What's the vibe?" — only labels with a cited basis are ever shown. */
export function VibeSection({ event: e }: { event: EventRecord }) {
  if (e.vibes.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border-[1.5px] border-dashed border-ink/25 p-6">
        <p className="font-bold">Vibe not confirmed yet.</p>
        <p className="t-meta mt-1 text-ink-soft">We only describe the vibe when the organizer or a verified source says so — no guesswork.</p>
      </div>
    );
  }
  const sourceLabel = (id: string | null) => e.sources.find((s) => s.id === id);
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {e.vibes.map((v, i) => {
        const h = HUE[v.tag];
        const src = sourceLabel(v.sourceId);
        return (
          <li
            key={v.tag}
            className="relative overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink p-5"
            style={{ background: h.bg, color: h.ink ? "var(--color-ink)" : "var(--color-cream)", animation: `rise .6s var(--ease-out-expo) ${i * 60}ms both` }}
          >
            <span aria-hidden="true" className="bandhani absolute inset-0 opacity-70" style={{ "--dot": h.ink ? "rgb(30 23 19 / .12)" : "rgb(244 236 221 / .14)", "--gap": "14px" } as React.CSSProperties} />
            <div className="relative">
              <p className="font-display text-2xl font-bold uppercase leading-none tracking-tight">{VIBE_META[v.tag].label}</p>
              <p className="mt-2 text-sm font-semibold">{VIBE_META[v.tag].line}</p>
              <p className="mt-4 rounded-xl bg-card/95 p-3 text-xs leading-relaxed text-ink">
                <span className="font-extrabold uppercase tracking-wider text-sindoor">Why we say so · </span>
                {v.evidence}
                {src && (
                  <>
                    {" "}
                    <a href={src.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-0.5 font-bold underline underline-offset-2">
                      {src.label}
                      <Icon name="external" size={11} />
                    </a>
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
