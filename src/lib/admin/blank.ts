import type { EventRecord, Submission } from "../types";
import { slugify } from "../format";

export function blankEvent(isDemo: boolean): EventRecord {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    title: isDemo ? "DEMO — " : "",
    status: "draft",
    isDemo,
    tagline: null,
    description: null,
    types: [],
    music: [],
    vibes: [],
    organizer: null,
    venue: { id: "", name: "", address: null, locality: "", area: "delhi" },
    occurrences: [],
    price: { status: "unknown", minInr: null, maxInr: null, note: null },
    entry: { couplesOnly: null, groupsAllowed: null, stagsAllowed: null, familiesWelcome: null, minAge: null, dressCode: null, note: null },
    food: { available: null, vegetarianOnly: null, note: null },
    booking: null,
    sources: [],
    media: [],
    crowd: null,
    verification: { dateChecked: false, priceChecked: false, entryChecked: false, lastCheckedAt: null },
    featured: false,
    scale: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Pre-fill a draft from a community suggestion. Nothing is marked verified — the moderator must check. */
export function eventFromSubmission(s: Submission, isDemo: boolean): EventRecord {
  const p = s.payload;
  const base = blankEvent(isDemo);
  const title = p.title ? (isDemo && !/^DEMO/.test(p.title) ? `DEMO — ${p.title}` : p.title) : base.title;
  return {
    ...base,
    title,
    slug: slugify(title.replace(/^DEMO\s*[—–-]\s*/, isDemo ? "demo-" : "")),
    types: p.types ?? [],
    music: p.music ?? [],
    organizer: p.organizerName ? { name: p.organizerName, url: null } : null,
    venue: { ...base.venue, name: p.venueName ?? "", locality: p.locality ?? "", area: p.area || "delhi" },
    occurrences: (p.dates ?? []).map((date) => ({ date, startTime: p.startTime ?? null, endTime: p.endTime ?? null, note: null })),
    price: {
      status: p.priceStatus === "free" || p.priceStatus === "paid" ? p.priceStatus : "unknown",
      minInr: p.priceStatus === "paid" ? (p.priceMin ?? null) : null,
      maxInr: null,
      note: null,
    },
    booking: p.bookingUrl ? { url: p.bookingUrl, platform: "", verified: false } : null,
    sources: s.evidenceUrls.map((url, i) => ({ id: `tmp-src-${i}`, kind: "community" as const, label: "Submitted evidence — verify", url, checkedAt: null })),
  };
}
