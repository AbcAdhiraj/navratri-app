import { MUSIC_META } from "@/lib/constants";
import type { EventRecord } from "@/lib/types";

export const NOT_CONFIRMED = "Not confirmed";

export function entrySummary(e: EventRecord): string[] {
  const x = e.entry;
  const out: string[] = [];
  if (x.couplesOnly === true) out.push("Couples only");
  if (x.stagsAllowed === true) out.push("Stags allowed");
  if (x.stagsAllowed === false) out.push("No stag entry");
  if (x.groupsAllowed === true) out.push("Groups allowed");
  if (x.groupsAllowed === false) out.push("No groups");
  if (x.familiesWelcome === true) out.push("Families welcome");
  if (x.minAge != null) out.push(`${x.minAge}+ only`);
  return out;
}

export function foodSummary(e: EventRecord): string {
  const f = e.food;
  if (f.available === false) return "No food on site";
  if (f.available === true && f.vegetarianOnly === true) return "Vegetarian food available";
  if (f.available === true) return "Food available";
  return NOT_CONFIRMED;
}

export function musicSummary(e: EventRecord): string {
  return e.music.length ? e.music.map((m) => MUSIC_META[m]).join(" · ") : NOT_CONFIRMED;
}

/** Rows for the detailed entry-policy table: [label, state] */
export function entryRows(e: EventRecord): { label: string; value: boolean | null; text?: string }[] {
  const x = e.entry;
  return [
    { label: "Groups", value: x.groupsAllowed },
    { label: "Stags (men without partners)", value: x.stagsAllowed },
    { label: "Couples only", value: x.couplesOnly },
    { label: "Families & kids", value: x.familiesWelcome },
    { label: "Minimum age", value: x.minAge != null ? true : null, text: x.minAge != null ? `${x.minAge}+` : undefined },
    { label: "Dress code", value: x.dressCode ? true : null, text: x.dressCode ?? undefined },
  ];
}
