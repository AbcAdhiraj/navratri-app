import { NAVRATRI_DAYS } from "./constants";
import { AREAS, EVENT_TYPES, MUSIC_STYLES, type EventRecord, type SubmissionPayload } from "./types";

export type Errors = Record<string, string>;

export const MAX_FILES = 3;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export function isHttpUrl(s: string, httpsOnly = false) {
  try {
    const u = new URL(s);
    return httpsOnly ? u.protocol === "https:" : u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export const CORRECTION_FIELDS = ["Date or time", "Price", "Venue or location", "Entry rules", "Booking link", "Music or vibe", "Event cancelled", "Something else"] as const;

export interface SubmissionInput {
  kind: "new_event" | "correction";
  eventSlug: string | null;
  payload: SubmissionPayload;
  links: string[];
  email: string;
  note: string;
}

/** Shared by the client (per step) and the server action (everything). */
export function validateSubmission(i: SubmissionInput, fileMeta: { size: number; type: string }[] = []): Errors {
  const e: Errors = {};
  const p = i.payload;
  if (i.kind === "new_event") {
    if (!p.title || p.title.trim().length < 3) e.title = "Give the event a name (3+ characters).";
    else if (p.title.length > 120) e.title = "Keep the name under 120 characters.";
    if (!p.area || !(AREAS as readonly string[]).includes(p.area)) e.area = "Pick the city.";
    if (!p.locality || p.locality.trim().length < 2) e.locality = "Which locality or sector?";
    if (!p.dates?.length) e.dates = "Pick at least one night.";
    else if (!p.dates.every((d) => NAVRATRI_DAYS.some((n) => n.date === d))) e.dates = "Pick nights between 11 and 19 October.";
    if (!p.priceStatus) e.priceStatus = "Tell us about entry — or choose “Not sure”.";
    if (p.priceStatus === "paid" && p.priceMin != null && (!Number.isInteger(p.priceMin) || p.priceMin < 1 || p.priceMin > 100000))
      e.priceMin = "Enter the lowest ticket price in rupees, e.g. 499.";
    if (p.bookingUrl && !isHttpUrl(p.bookingUrl, true)) e.bookingUrl = "Booking links must start with https://";
    if (p.types && !p.types.every((t) => (EVENT_TYPES as readonly string[]).includes(t))) e.types = "Unknown event type.";
    if (p.music && !p.music.every((t) => (MUSIC_STYLES as readonly string[]).includes(t))) e.music = "Unknown music style.";
  } else {
    if (!i.eventSlug) e.event = "Choose the listing you want to correct.";
    if (!p.fields?.length) e.fields = "What’s wrong? Pick at least one.";
    if (!p.details || p.details.trim().length < 10) e.details = "Tell us what the correct information is (10+ characters).";
    else if (p.details.length > 2000) e.details = "Keep it under 2,000 characters.";
  }
  const links = i.links.map((l) => l.trim()).filter(Boolean);
  if (links.some((l) => !isHttpUrl(l))) e.links = "Links must be full web addresses starting with https://";
  if (links.length === 0 && fileMeta.length === 0) e.evidence = "Add at least one link or file so a moderator can check it.";
  if (fileMeta.length > MAX_FILES) e.files = `Up to ${MAX_FILES} files.`;
  if (fileMeta.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) e.files = "Files must total 4 MB or less.";
  if (fileMeta.some((f) => !ACCEPTED_TYPES.includes(f.type))) e.files = "Only JPG, PNG, WebP, HEIC or PDF files.";
  if (i.email && !isEmail(i.email)) e.email = "That email doesn’t look right.";
  if (i.note.length > 2000) e.note = "Keep the note under 2,000 characters.";
  return e;
}

/** Admin-side checks before an event can be saved/published. */
export function validateEvent(ev: EventRecord): Errors {
  const e: Errors = {};
  if (ev.title.trim().length < 3) e.title = "Title is required.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ev.slug)) e.slug = "Slug: lowercase letters, numbers and single hyphens.";
  if (ev.isDemo && !/^DEMO\s*[—–-]/.test(ev.title)) e.title = "Demo fixtures must be titled “DEMO — …”.";
  if (!ev.isDemo && /^DEMO\b/i.test(ev.title)) e.title = "Real events can’t be titled DEMO.";
  if (!ev.venue.name.trim()) e.venueName = "Venue name is required.";
  if (!ev.venue.locality.trim()) e.locality = "Locality is required.";
  if (ev.price.status === "paid" && ev.price.minInr != null && ev.price.minInr <= 0) e.price = "Paid events need a price above ₹0 (or leave it blank).";
  if (ev.price.status !== "paid" && (ev.price.minInr != null || ev.price.maxInr != null)) e.price = "Only paid events carry a price.";
  if (ev.price.maxInr != null && ev.price.minInr != null && ev.price.maxInr < ev.price.minInr) e.price = "Max price can’t be below the min.";
  if (ev.booking && !isHttpUrl(ev.booking.url, true)) e.booking = "Booking URL must be https://";
  if (ev.booking?.verified && !ev.booking.url) e.booking = "A verified booking needs a URL.";
  if (ev.vibes.some((v) => v.evidence.trim().length < 5)) e.vibes = "Every vibe needs its evidence.";
  if (ev.sources.some((s) => !isHttpUrl(s.url))) e.sources = "Source URLs must be valid.";
  if (ev.occurrences.some((o) => !/^\d{4}-\d{2}-\d{2}$/.test(o.date))) e.occurrences = "Dates must be YYYY-MM-DD.";
  if (ev.status === "published") {
    if (ev.occurrences.length === 0) e.occurrences = "Publishing needs at least one date.";
    if (ev.sources.length === 0) e.sources = "Publishing needs at least one source.";
    if (!ev.verification.lastCheckedAt) e.verification = "Publishing needs a last-checked date.";
  }
  if (ev.crowd && (ev.crowd.reportCount < 3 || ev.crowd.womenPctLow > ev.crowd.womenPctHigh)) e.crowd = "Crowd impressions need ≥ 3 reports and a valid range.";
  return e;
}
