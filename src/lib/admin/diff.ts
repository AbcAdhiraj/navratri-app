import { AREA_META } from "../constants";
import { priceLabel } from "../format";
import type { EventRecord } from "../types";

const tri = (v: boolean | null | undefined) => (v === true ? "yes" : v === false ? "no" : "not confirmed");

/** Flatten an event into human-readable fields for revision comparison. */
export function flatten(e: Partial<EventRecord> | null | undefined): Record<string, string> {
  if (!e) return {};
  const out: Record<string, string> = {};
  const put = (k: string, v: unknown) => {
    if (v !== undefined) out[k] = v === null || v === "" ? "—" : String(v);
  };
  put("Title", e.title);
  put("Slug", e.slug);
  put("Status", e.status);
  put("Demo fixture", e.isDemo);
  put("Featured", e.featured);
  put("Scale", e.scale);
  put("Tagline", e.tagline);
  put("Description", e.description);
  if (e.venue) put("Venue", `${e.venue.name} · ${e.venue.locality}, ${AREA_META[e.venue.area]?.label ?? e.venue.area}${e.venue.address ? ` · ${e.venue.address}` : ""}`);
  if (e.occurrences) put("Dates", e.occurrences.map((o) => `${o.date} ${o.startTime ?? "?"}–${o.endTime ?? "?"}`).join("; "));
  if (e.price) put("Price", `${priceLabel(e.price, "long")}${e.price.note ? ` (${e.price.note})` : ""}`);
  if (e.entry)
    put(
      "Entry",
      `groups ${tri(e.entry.groupsAllowed)}, stags ${tri(e.entry.stagsAllowed)}, couples-only ${tri(e.entry.couplesOnly)}, families ${tri(e.entry.familiesWelcome)}, min age ${e.entry.minAge ?? "—"}, dress ${e.entry.dressCode ?? "—"}`,
    );
  if (e.food) put("Food", `available ${tri(e.food.available)}, veg-only ${tri(e.food.vegetarianOnly)}${e.food.note ? ` (${e.food.note})` : ""}`);
  if (e.types) put("Types", e.types.join(", "));
  if (e.music) put("Music", e.music.join(", "));
  if (e.vibes) put("Vibes", e.vibes.map((v) => `${v.tag}: ${v.evidence}`).join(" | "));
  if (e.organizer !== undefined) put("Organizer", e.organizer ? `${e.organizer.name}${e.organizer.url ? ` (${e.organizer.url})` : ""}` : null);
  if (e.booking !== undefined) put("Booking", e.booking ? `${e.booking.url} · ${e.booking.platform} · ${e.booking.verified ? "verified" : "unverified"}` : null);
  if (e.sources) put("Sources", e.sources.map((s) => `${s.kind}: ${s.url}`).join(" | "));
  if (e.media) put("Media", e.media.map((m) => m.url).join(" | "));
  if (e.crowd !== undefined) put("Crowd", e.crowd ? `${e.crowd.womenPctLow}–${e.crowd.womenPctHigh}% women · ${e.crowd.reportCount} reports · ${e.crowd.editionLabel}` : null);
  if (e.verification)
    put("Verification", `date ${e.verification.dateChecked ? "✓" : "✗"}, price ${e.verification.priceChecked ? "✓" : "✗"}, entry ${e.verification.entryChecked ? "✓" : "✗"}, checked ${e.verification.lastCheckedAt ?? "—"}`);
  return out;
}

export function diffEvents(before: Partial<EventRecord> | null, after: Partial<EventRecord>) {
  const a = flatten(before);
  const b = flatten(after);
  return Object.keys({ ...a, ...b })
    .filter((k) => a[k] !== b[k])
    .map((k) => ({ field: k, before: a[k] ?? "—", after: b[k] ?? "—" }));
}
