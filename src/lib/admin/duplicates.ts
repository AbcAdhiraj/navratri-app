import type { Area, EventRecord } from "../types";

const STOP = new Set(["demo", "the", "night", "nights", "navratri", "utsav", "mahotsav", "and", "at", "in", "of", "2026"]);

export function normTitle(s: string) {
  return s
    .toLowerCase()
    .replace(/^demo\s*[—–-]\s*/, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .join(" ");
}

function bigrams(s: string) {
  const t = ` ${s} `;
  const out = new Map<string, number>();
  for (let i = 0; i < t.length - 1; i++) {
    const g = t.slice(i, i + 2);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

/** Sørensen–Dice similarity on character bigrams (0..1). */
export function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  const A = bigrams(a);
  const B = bigrams(b);
  let inter = 0;
  let size = 0;
  A.forEach((n, g) => {
    inter += Math.min(n, B.get(g) ?? 0);
    size += n;
  });
  B.forEach((n) => (size += n));
  return (2 * inter) / size;
}

export interface DuplicateCandidate {
  event: EventRecord;
  score: number;
  reasons: string[];
}

/** Likely duplicates for a new submission or event draft. */
export function findDuplicates(
  c: { title?: string; area?: Area | ""; locality?: string; venueName?: string; dates?: string[]; excludeId?: string },
  events: EventRecord[],
): DuplicateCandidate[] {
  const t = normTitle(c.title ?? "");
  return events
    .filter((e) => e.id !== c.excludeId)
    .map((e) => {
      // Weighted evidence, capped at 1: the name matters most, then place and overlapping nights.
      const reasons: string[] = [];
      const titleSim = similarity(t, normTitle(e.title));
      let score = titleSim * 0.55;
      if (titleSim > 0.5) reasons.push(`Similar name (${Math.round(titleSim * 100)}%)`);
      if (c.area && e.venue.area === c.area) {
        score += 0.1;
        reasons.push("Same city");
      }
      if (c.locality && similarity(c.locality.toLowerCase(), e.venue.locality.toLowerCase()) > 0.7) {
        score += 0.12;
        reasons.push("Same locality");
      }
      if (c.venueName && similarity(normTitle(c.venueName), normTitle(e.venue.name)) > 0.6) {
        score += 0.13;
        reasons.push("Similar venue");
      }
      const overlap = (c.dates ?? []).filter((d) => e.occurrences.some((o) => o.date === d)).length;
      if (overlap) {
        score += Math.min(0.1, overlap * 0.035);
        reasons.push(`${overlap} overlapping night${overlap > 1 ? "s" : ""}`);
      }
      return { event: e, score: Math.min(1, score), reasons };
    })
    .filter((x) => x.score >= 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
