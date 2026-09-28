import type { Area, EventType, MusicStyle, SourceKind, VibeTag } from "./types";

export const SITE_NAME = "Navratri NCR";
export const SITE_TAGLINE = "Your Navratri plans, sorted.";
export const SITE_DESCRIPTION =
  "Discover garba, dandiya, Bollywood and DJ Navratri nights across Delhi, Dwarka, Noida, Gurugram and Ghaziabad — with verified dates, prices and entry rules.";

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Sharad Navratri 2026 — nine nights, 11–19 October (Asia/Kolkata). */
export const NAVRATRI_YEAR = 2026;
export const NAVRATRI_DAYS: { date: string; night: number }[] = Array.from({ length: 9 }, (_, i) => ({
  date: `2026-10-${String(11 + i).padStart(2, "0")}`,
  night: i + 1,
}));
export const NAVRATRI_START = NAVRATRI_DAYS[0].date;
export const NAVRATRI_END = NAVRATRI_DAYS[NAVRATRI_DAYS.length - 1].date;

export const AREA_META: Record<Area, { label: string; short: string; blurb: string }> = {
  delhi: { label: "Delhi", short: "DEL", blurb: "Colony grounds, club lawns & big-ticket nights" },
  dwarka: { label: "Dwarka", short: "DWK", blurb: "Society garbas & sector-ground dandiya" },
  noida: { label: "Noida", short: "NOI", blurb: "Sector lawns, stadium nights & RWA circles" },
  gurugram: { label: "Gurugram", short: "GGN", blurb: "Big productions, DJ nights & rooftop raas" },
  ghaziabad: { label: "Ghaziabad", short: "GZB", blurb: "Indirapuram circles & community pandals" },
};

export const EVENT_TYPE_META: Record<EventType, { label: string; plural: string }> = {
  garba: { label: "Garba", plural: "Garba nights" },
  dandiya: { label: "Dandiya", plural: "Dandiya nights" },
  bollywood: { label: "Bollywood night", plural: "Bollywood nights" },
  dj_edm: { label: "DJ / EDM", plural: "DJ & EDM nights" },
  ticketed: { label: "Big ticketed", plural: "Big ticketed events" },
  community: { label: "Community", plural: "Community events" },
  society_rwa: { label: "Society / RWA", plural: "Society & RWA events" },
};

export const MUSIC_META: Record<MusicStyle, string> = {
  traditional_garba: "Traditional Garba",
  dandiya_beats: "Dandiya",
  bollywood: "Bollywood",
  dj_edm: "DJ / EDM",
  live_band: "Live band",
  folk: "Folk",
  devotional: "Devotional / Aarti",
};

export const VIBE_META: Record<VibeTag, { label: string; line: string }> = {
  traditional_garba: { label: "Traditional Garba", line: "Gujarati-style garba circles" },
  bollywood_mix: { label: "Bollywood Mix", line: "Garba meets Bollywood dance floor" },
  dandiya_night: { label: "Dandiya Night", line: "Sticks up — dandiya is the main event" },
  late_night: { label: "Late Night", line: "Runs well past 11 PM" },
  dj_night: { label: "DJ Night", line: "A DJ drives the second half" },
  live_music: { label: "Live Music", line: "Live singers, dhol or band on stage" },
  family_friendly: { label: "Family Friendly", line: "Kids and elders explicitly welcome" },
  large_scale: { label: "Big Production", line: "Large grounds, stage and sound" },
};

export const SOURCE_KIND_META: Record<SourceKind, string> = {
  organizer: "Organizer",
  ticketing: "Ticketing platform",
  venue: "Venue",
  social: "Official social post",
  news: "News report",
  community: "Community submission (verified)",
};

export const PRICE_BUCKETS = [
  { id: "free", label: "Free entry" },
  { id: "under500", label: "Under ₹500" },
  { id: "500to1500", label: "₹500–1,500" },
  { id: "1500plus", label: "₹1,500+" },
] as const;
export type PriceBucket = (typeof PRICE_BUCKETS)[number]["id"];

export const ENTRY_FILTERS = [
  { id: "stags", label: "Stags allowed" },
  { id: "groups", label: "Groups allowed" },
  { id: "families", label: "Family friendly" },
  { id: "couples", label: "Couples only" },
] as const;
export type EntryFilter = (typeof ENTRY_FILTERS)[number]["id"];
