/**
 * Core domain types. These mirror the Supabase schema in supabase/migrations,
 * with explicit "unknown" states: `null` always means "not confirmed", never "no".
 */

export const AREAS = ["delhi", "dwarka", "noida", "gurugram", "ghaziabad"] as const;
export type Area = (typeof AREAS)[number];

export const EVENT_TYPES = [
  "garba",
  "dandiya",
  "bollywood",
  "dj_edm",
  "ticketed",
  "community",
  "society_rwa",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const MUSIC_STYLES = [
  "traditional_garba",
  "dandiya_beats",
  "bollywood",
  "dj_edm",
  "live_band",
  "folk",
  "devotional",
] as const;
export type MusicStyle = (typeof MUSIC_STYLES)[number];

export const VIBE_TAGS = [
  "traditional_garba",
  "bollywood_mix",
  "dandiya_night",
  "late_night",
  "dj_night",
  "live_music",
  "family_friendly",
  "large_scale",
] as const;
export type VibeTag = (typeof VIBE_TAGS)[number];

export const SOURCE_KINDS = ["organizer", "ticketing", "venue", "social", "news", "community"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const EVENT_STATUSES = ["draft", "published", "cancelled", "archived"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export type PriceStatus = "unknown" | "free" | "paid";
/** true = confirmed yes, false = confirmed no, null = not confirmed */
export type TriState = boolean | null;
export type Scale = "intimate" | "mid" | "large";

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  locality: string;
  area: Area;
}

export interface Occurrence {
  /** YYYY-MM-DD, Asia/Kolkata */
  date: string;
  /** HH:MM 24h, or null when not confirmed */
  startTime: string | null;
  endTime: string | null;
  note: string | null;
}

export interface Price {
  status: PriceStatus;
  minInr: number | null;
  maxInr: number | null;
  note: string | null;
}

export interface EntryPolicy {
  couplesOnly: TriState;
  groupsAllowed: TriState;
  stagsAllowed: TriState;
  familiesWelcome: TriState;
  minAge: number | null;
  dressCode: string | null;
  note: string | null;
}

export interface FoodInfo {
  available: TriState;
  vegetarianOnly: TriState;
  note: string | null;
}

export interface Source {
  id: string;
  kind: SourceKind;
  label: string;
  url: string;
  checkedAt: string | null;
}

export interface Booking {
  url: string;
  platform: string;
  /** Only verified links render a booking CTA. */
  verified: boolean;
}

export interface Media {
  id: string;
  url: string;
  alt: string;
  credit: string | null;
  year: number | null;
  width: number | null;
  height: number | null;
}

export interface Vibe {
  tag: VibeTag;
  /** Short factual basis, e.g. "Organizer listing: 'traditional Gujarati garba with live dhol'". */
  evidence: string;
  sourceId: string | null;
}

export interface CrowdReport {
  /** e.g. "2025 edition" — never "tonight". */
  editionLabel: string;
  womenPctLow: number;
  womenPctHigh: number;
  reportCount: number;
}

export interface Verification {
  dateChecked: boolean;
  priceChecked: boolean;
  entryChecked: boolean;
  lastCheckedAt: string | null;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  status: EventStatus;
  /** Development fixture. Never shown without a DEMO label. */
  isDemo: boolean;
  tagline: string | null;
  description: string | null;
  types: EventType[];
  music: MusicStyle[];
  vibes: Vibe[];
  organizer: { name: string; url: string | null } | null;
  venue: Venue;
  occurrences: Occurrence[];
  price: Price;
  entry: EntryPolicy;
  food: FoodInfo;
  booking: Booking | null;
  sources: Source[];
  media: Media[];
  crowd: CrowdReport | null;
  verification: Verification;
  featured: boolean;
  scale: Scale | null;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Submissions & moderation ---------- */

export const SUBMISSION_KINDS = ["new_event", "correction"] as const;
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number];
export const SUBMISSION_STATUSES = ["pending", "approved", "rejected", "duplicate"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export interface SubmissionPayload {
  title?: string;
  area?: Area | "";
  locality?: string;
  venueName?: string;
  dates?: string[];
  startTime?: string;
  endTime?: string;
  priceStatus?: PriceStatus;
  priceMin?: number | null;
  priceNote?: string;
  types?: EventType[];
  music?: MusicStyle[];
  organizerName?: string;
  bookingUrl?: string;
  /** For corrections: which field(s) are wrong and what's correct. */
  fields?: string[];
  details?: string;
}

export interface Submission {
  id: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  eventId: string | null;
  eventSlug: string | null;
  payload: SubmissionPayload;
  evidenceUrls: string[];
  evidenceFiles: string[];
  contactEmail: string | null;
  submitterNote: string | null;
  createdAt: string;
}

export interface ModerationDecision {
  id: string;
  submissionId: string | null;
  eventId: string | null;
  action: "approve" | "reject" | "mark_duplicate" | "publish" | "unpublish" | "edit";
  note: string | null;
  actor: string;
  createdAt: string;
}

export interface Revision {
  id: string;
  eventId: string;
  before: Partial<EventRecord> | null;
  after: Partial<EventRecord>;
  actor: string;
  submissionId: string | null;
  createdAt: string;
}
