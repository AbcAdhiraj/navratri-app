import { rng } from "./seed";

interface RangoliOptions {
  seed?: number;
  size?: number;
  rings?: number;
  colors?: string[];
  strokeOnly?: boolean;
  strokeWidth?: number;
  counts?: number[];
}

type Shape =
  | { key: string; kind: "path"; d: string; transform: string; fill: string; stroke: string; strokeWidth: number }
  | { key: string; kind: "circle"; cx: number; cy: number; r: number; fill: string; stroke?: string; strokeOpacity?: number; strokeWidth?: number };

const fmt = (n: number) => Math.round(n * 100) / 100;

function petal(r0: number, r1: number, w: number) {
  const m = (r0 + r1) / 2;
  return `M0,${fmt(-r0)} Q${fmt(w)},${fmt(-m)} 0,${fmt(-r1)} Q${fmt(-w)},${fmt(-m)} 0,${fmt(-r0)}Z`;
}

/**
 * Parametric rangoli geometry: concentric rings of petals and dots. Deterministic for a seed so it
 * renders identically on server and client, and can be serialised for OG images.
 */
function shapes({
  seed = 7,
  size = 400,
  rings = 6,
  colors = ["#f3b61f", "#bd1f1a", "#1f2f6d", "#f4ecdd"],
  strokeOnly = false,
  strokeWidth = 1,
  counts = [8, 12, 16, 24, 32],
}: RangoliOptions): Shape[] {
  const r = rng(seed);
  const R = size / 2;
  const out: Shape[] = [];
  let radius = R * 0.08;
  for (let i = 0; i < rings; i++) {
    const n = counts[Math.floor(r() * counts.length)];
    const depth = ((R * 0.86 - radius) / (rings - i)) * (0.8 + r() * 0.5);
    const r0 = radius;
    const r1 = Math.min(R * 0.94, radius + depth);
    const w = ((Math.PI * 2 * ((r0 + r1) / 2)) / n) * (0.32 + r() * 0.2);
    const color = colors[i % colors.length];
    const d = petal(r0, r1, w);
    const filled = !(i % 2 === 0 || strokeOnly);
    for (let k = 0; k < n; k++) {
      out.push({
        key: `p${i}-${k}`,
        kind: "path",
        d,
        transform: `rotate(${fmt((360 / n) * k + (i % 2 ? 180 / n : 0))})`,
        fill: filled ? color : "none",
        stroke: filled ? "none" : color,
        strokeWidth,
      });
    }
    const dots = n * 2;
    const dr = r1 + (R * 0.02 + r() * R * 0.02);
    if (dr < R * 0.97) {
      for (let k = 0; k < dots; k++) {
        const a = ((Math.PI * 2) / dots) * k;
        out.push({ key: `d${i}-${k}`, kind: "circle", cx: fmt(Math.cos(a) * dr), cy: fmt(Math.sin(a) * dr), r: fmt(Math.max(0.8, R * 0.007)), fill: colors[(i + 1) % colors.length] });
      }
    }
    out.push({ key: `c${i}`, kind: "circle", cx: 0, cy: 0, r: fmt(r1), fill: "none", stroke: color, strokeOpacity: 0.4, strokeWidth: strokeWidth * 0.6 });
    radius = r1 + R * 0.035;
    if (radius > R * 0.9) break;
  }
  out.push({ key: "core", kind: "circle", cx: 0, cy: 0, r: fmt(R * 0.05), fill: colors[1 % colors.length] });
  out.push({ key: "core2", kind: "circle", cx: 0, cy: 0, r: fmt(R * 0.025), fill: colors[0] });
  return out;
}

/** React elements (colours may be CSS variables — applied via `style` so var() works). */
export function rangoliElements(opts: RangoliOptions) {
  return shapes(opts).map((s) =>
    s.kind === "path" ? (
      <path key={s.key} d={s.d} transform={s.transform} style={{ fill: s.fill, stroke: s.stroke, strokeWidth: s.strokeWidth }} />
    ) : (
      <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} style={{ fill: s.fill, stroke: s.stroke, strokeOpacity: s.strokeOpacity, strokeWidth: s.strokeWidth }} />
    ),
  );
}

/** Standalone SVG markup, for OpenGraph images. Colours must be literal. */
export function rangoliSvg(opts: RangoliOptions & { size?: number }) {
  const size = opts.size ?? 400;
  const R = size / 2;
  const body = shapes(opts)
    .map((s) =>
      s.kind === "path"
        ? `<path d="${s.d}" transform="${s.transform}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`
        : `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-opacity="${s.strokeOpacity ?? 1}" stroke-width="${s.strokeWidth ?? 1}"` : ""}/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-R} ${-R} ${size} ${size}" width="${size}" height="${size}">${body}</svg>`;
}

export function Rangoli({ className, opacity = 1, size = 400, ...opts }: RangoliOptions & { className?: string; opacity?: number }) {
  const R = size / 2;
  return (
    <svg viewBox={`${-R} ${-R} ${size} ${size}`} width="100%" height="100%" className={className} aria-hidden="true" style={{ opacity }}>
      {rangoliElements({ ...opts, size })}
    </svg>
  );
}
