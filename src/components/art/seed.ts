export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Flat, two-ink "block print" palettes drawn from textile dyes.
 * `light` marks backgrounds that need ink-coloured text on top.
 */
export const PALETTES = [
  { name: "sindoor", bg: "#bd1f1a", motif: "#f3b61f", accent: "#f4ecdd", light: false },
  { name: "neel", bg: "#1f2f6d", motif: "#f4ecdd", accent: "#f3b61f", light: false },
  { name: "haldi", bg: "#f3b61f", motif: "#bd1f1a", accent: "#1e1713", light: true },
  { name: "mehendi", bg: "#3c6a32", motif: "#f3b61f", accent: "#f4ecdd", light: false },
  { name: "rani", bg: "#c81e68", motif: "#f4ecdd", accent: "#f3b61f", light: false },
  { name: "ink", bg: "#1e1713", motif: "#f3b61f", accent: "#e46f1a", light: false },
  { name: "khadi", bg: "#ebdfc8", motif: "#bd1f1a", accent: "#1f2f6d", light: true },
  { name: "kesar", bg: "#e46f1a", motif: "#f4ecdd", accent: "#1e1713", light: true },
] as const;
export type Palette = (typeof PALETTES)[number];

const BY_NAME = Object.fromEntries(PALETTES.map((p) => [p.name, p])) as Record<Palette["name"], Palette>;

/** Colour follows the event's primary type, so the grid reads like a legend, with seeded variety within it. */
const TYPE_PALETTES: Record<string, Palette["name"][]> = {
  garba: ["sindoor", "haldi", "neel", "kesar"],
  dandiya: ["neel", "rani", "haldi"],
  bollywood: ["rani", "kesar", "ink"],
  dj_edm: ["ink", "neel", "rani"],
  ticketed: ["sindoor", "ink", "neel", "haldi"],
  community: ["mehendi", "khadi", "haldi"],
  society_rwa: ["khadi", "mehendi", "kesar"],
};

export function paletteFor(seed: string, type?: string): Palette {
  const h = hash(seed);
  const names = type ? TYPE_PALETTES[type] : undefined;
  if (names) return BY_NAME[names[h % names.length]];
  return PALETTES[h % PALETTES.length];
}
