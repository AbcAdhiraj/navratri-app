import { EVENT_TYPE_META } from "@/lib/constants";
import type { EventType } from "@/lib/types";
import { SPRITE_COUNT } from "./RangoliSprite";
import { hash, paletteFor } from "./seed";

interface PosterArtProps {
  seed: string;
  type?: EventType;
  /** Show the oversized type word as texture. */
  word?: boolean;
  className?: string;
  density?: "full" | "light";
}

/**
 * Original "block-print poster" artwork, shown whenever an event has no authorised photography.
 * Flat textile colours, a rangoli stamp and a bandhani dot field — deterministic per event, never stock.
 */
export function PosterArt({ seed, type, word = true, className, density = "full" }: PosterArtProps) {
  const p = paletteFor(seed, type);
  const h = hash(seed);
  const variant = h % 3;
  const rot = (h >> 3) % 360;
  const vars = { "--rc0": p.motif, "--rc1": p.accent, "--rc2": p.motif, "--rc3": p.accent } as React.CSSProperties;
  const label = type ? EVENT_TYPE_META[type].label.split(" ")[0].replace("/", "") : "Raas";
  const dot = p.light ? "rgb(30 23 19 / 0.16)" : "rgb(244 236 221 / 0.2)";

  const place =
    variant === 0
      ? { width: "120%", right: "-38%", top: "-30%" }
      : variant === 1
        ? { width: "105%", left: "-30%", top: "-18%" }
        : { width: "110%", left: "18%", bottom: "-50%" };

  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden [container-type:inline-size] ${className ?? ""}`} style={{ background: p.bg }}>
      {/* bandhani field */}
      <div
        className="bandhani absolute inset-x-0"
        style={{ "--dot": dot, "--gap": "14px", ...(variant === 2 ? { top: 0, height: "45%" } : { bottom: 0, height: "46%" }) } as unknown as React.CSSProperties}
      />
      {/* rangoli stamp */}
      <div className="card-media absolute aspect-square" style={place}>
        <svg viewBox="0 0 400 400" className="h-full w-full" style={{ transform: `rotate(${rot}deg)`, opacity: density === "light" ? 0.8 : 0.95, ...vars }}>
          <use href={`#rgl-${h % SPRITE_COUNT}`} width="400" height="400" />
        </svg>
      </div>
      {/* printed frame */}
      <div className="absolute inset-2.5 rounded-[calc(var(--radius-card)-6px)] border" style={{ borderColor: p.light ? "rgb(30 23 19 / 0.22)" : "rgb(244 236 221 / 0.28)" }} />
      {word && (
        <div
          className="t-display pointer-events-none absolute -bottom-[0.08em] left-[0.04em] select-none whitespace-nowrap"
          style={{
            fontSize: "min(34cqi, 14rem)",
            color: "transparent",
            WebkitTextStroke: `1.2px ${p.light ? "rgb(30 23 19 / 0.28)" : "rgb(244 236 221 / 0.32)"}`,
            lineHeight: 0.8,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function posterIsLight(seed: string, type?: EventType) {
  return paletteFor(seed, type).light;
}
