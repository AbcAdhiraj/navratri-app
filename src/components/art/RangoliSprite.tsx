import { rangoliElements } from "./Rangoli";

export const SPRITE_COUNT = 8;
const VARS = ["var(--rc0)", "var(--rc1)", "var(--rc2)", "var(--rc3)"];

/**
 * A handful of rangoli designs defined once per page as <symbol>s. Poster cards reference them
 * with <use>, recolouring through inherited CSS variables — keeps the DOM light with many cards.
 */
export function RangoliSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {Array.from({ length: SPRITE_COUNT }, (_, i) => (
          <symbol id={`rgl-${i}`} key={i} viewBox="-200 -200 400 400">
            {rangoliElements({ seed: 101 + i * 37, size: 400, rings: 5, colors: VARS, strokeWidth: 1.6, counts: [8, 12, 16, 24] })}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}
