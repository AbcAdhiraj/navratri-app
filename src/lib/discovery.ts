/** Pure discovery logic shared by server pages and client components. */
import {
  AREA_META,
  ENTRY_FILTERS,
  NAVRATRI_DAYS,
  NAVRATRI_END,
  NAVRATRI_START,
  PRICE_BUCKETS,
  type EntryFilter,
  type PriceBucket,
} from "./constants";
import { todayIST } from "./format";
import {
  AREAS,
  EVENT_TYPES,
  MUSIC_STYLES,
  type Area,
  type EventRecord,
  type EventType,
  type MusicStyle,
} from "./types";

export interface Filters {
  date: string | null;
  area: Area | null;
  locality: string | null;
  price: PriceBucket | null;
  music: MusicStyle[];
  entry: EntryFilter[];
  type: EventType[];
  q: string;
}

export const EMPTY_FILTERS: Filters = {
  date: null,
  area: null,
  locality: null,
  price: null,
  music: [],
  entry: [],
  type: [],
  q: "",
};

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function get(p: Params, k: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(k) ?? undefined;
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
}
function list<T extends string>(p: Params, k: string, allowed: readonly T[]): T[] {
  const raw = get(p, k);
  if (!raw) return [];
  return raw.split(",").filter((x): x is T => (allowed as readonly string[]).includes(x));
}

export function parseFilters(p: Params): Filters {
  const date = get(p, "date");
  const area = get(p, "area");
  const price = get(p, "price");
  return {
    date: date && NAVRATRI_DAYS.some((d) => d.date === date) ? date : null,
    area: area && (AREAS as readonly string[]).includes(area) ? (area as Area) : null,
    locality: get(p, "locality")?.slice(0, 60) || null,
    price: price && PRICE_BUCKETS.some((b) => b.id === price) ? (price as PriceBucket) : null,
    music: list(p, "music", MUSIC_STYLES),
    entry: list(
      p,
      "entry",
      ENTRY_FILTERS.map((e) => e.id),
    ),
    type: list(p, "type", EVENT_TYPES),
    q: (get(p, "q") ?? "").slice(0, 80),
  };
}

export function filtersToQuery(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.date) sp.set("date", f.date);
  if (f.area) sp.set("area", f.area);
  if (f.locality) sp.set("locality", f.locality);
  if (f.price) sp.set("price", f.price);
  if (f.type.length) sp.set("type", f.type.join(","));
  if (f.music.length) sp.set("music", f.music.join(","));
  if (f.entry.length) sp.set("entry", f.entry.join(","));
  if (f.q) sp.set("q", f.q);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: Filters) {
  return (
    (f.date ? 1 : 0) +
    (f.area ? 1 : 0) +
    (f.locality ? 1 : 0) +
    (f.price ? 1 : 0) +
    f.music.length +
    f.entry.length +
    f.type.length
  );
}

export function onDate(e: EventRecord, date: string) {
  return e.occurrences.some((o) => o.date === date);
}

export function matchesPrice(e: EventRecord, b: PriceBucket) {
  const p = e.price;
  if (b === "free") return p.status === "free";
  if (p.status !== "paid" || p.minInr == null) return false;
  if (b === "under500") return p.minInr < 500;
  if (b === "500to1500") return p.minInr >= 500 && p.minInr <= 1500;
  return p.minInr > 1500;
}

export function matchesEntry(e: EventRecord, f: EntryFilter) {
  // Only confirmed facts match — "not confirmed" never satisfies a filter.
  if (f === "stags") return e.entry.stagsAllowed === true;
  if (f === "groups") return e.entry.groupsAllowed === true;
  if (f === "families") return e.entry.familiesWelcome === true;
  return e.entry.couplesOnly === true;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, " ");

export function searchText(e: EventRecord) {
  return norm(
    [e.title, e.venue.name, e.venue.locality, AREA_META[e.venue.area].label, e.organizer?.name ?? "", e.tagline ?? ""].join(
      " ",
    ),
  );
}

export function matchesQuery(e: EventRecord, q: string) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = searchText(e);
  return terms.every((t) => hay.includes(t));
}

export function applyFilters(events: EventRecord[], f: Filters) {
  return sortEvents(
    events.filter(
      (e) =>
        (!f.date || onDate(e, f.date)) &&
        (!f.area || e.venue.area === f.area) &&
        (!f.locality || e.venue.locality.toLowerCase() === f.locality.toLowerCase()) &&
        (!f.price || matchesPrice(e, f.price)) &&
        (f.type.length === 0 || f.type.some((t) => e.types.includes(t))) &&
        (f.music.length === 0 || f.music.some((m) => e.music.includes(m))) &&
        f.entry.every((x) => matchesEntry(e, x)) &&
        matchesQuery(e, f.q),
    ),
    f.date,
  );
}

const SCALE_RANK = { large: 3, mid: 2, intimate: 1 } as const;

export function firstDate(e: EventRecord, from?: string | null) {
  const dates = e.occurrences.map((o) => o.date).sort();
  return (from ? dates.find((d) => d >= from) : undefined) ?? dates[0] ?? "9999";
}

export function sortEvents(events: EventRecord[], date?: string | null) {
  return [...events].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      firstDate(a, date).localeCompare(firstDate(b, date)) ||
      (SCALE_RANK[b.scale ?? "intimate"] ?? 0) - (SCALE_RANK[a.scale ?? "intimate"] ?? 0) ||
      a.title.localeCompare(b.title),
  );
}

/** The date the homepage should focus on: today during Navratri, otherwise opening night. */
export function focusDate(now = new Date()) {
  const today = todayIST(now);
  if (today >= NAVRATRI_START && today <= NAVRATRI_END) return { date: today, isToday: true };
  if (today > NAVRATRI_END) return { date: NAVRATRI_END, isToday: false };
  return { date: NAVRATRI_START, isToday: false };
}

export interface Section {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  events: EventRecord[];
  href: string;
}

const MIN_SECTION = 3;

export function editorialSections(events: EventRecord[]): Section[] {
  const s = sortEvents(events);
  const onPlatform = (e: EventRecord) => e.sources.some((x) => x.kind === "ticketing" && /district\.in|bookmyshow\.com/.test(x.url));
  const sections: Section[] = [
    {
      id: "listed",
      kicker: "Just listed",
      title: "Fresh on the ticketing sites",
      blurb: "Picked up from public District listings. Not verified by us yet — check the listing before you book.",
      events: s.filter(onPlatform),
      href: "/events?type=ticketed",
    },
    {
      id: "garba-guide",
      kicker: "The Garba Guide",
      title: "Circles the traditional way",
      blurb: "Gujarati-style garba, live dhol and aarti before the first taali.",
      events: s.filter((e) => e.vibes.some((v) => v.tag === "traditional_garba")),
      href: "/events?music=traditional_garba",
    },
    {
      id: "big-nights",
      kicker: "Big Nights",
      title: "Stages, lights, thousands in the circle",
      blurb: "Large ticketed productions worth planning the whole evening around.",
      events: s.filter((e) => e.types.includes("ticketed") && (e.scale === "large" || e.featured)),
      href: "/events?type=ticketed",
    },
    {
      id: "after-dark",
      kicker: "Dandiya After Dark",
      title: "When the DJ takes over",
      blurb: "Late finishes, Bollywood sets and DJ-led dandiya.",
      events: s.filter((e) => e.vibes.some((v) => v.tag === "late_night" || v.tag === "dj_night")),
      href: "/events?type=dj_edm",
    },
    {
      id: "under-500",
      kicker: "Under ₹500",
      title: "Big energy, small ticket",
      blurb: "Confirmed prices below ₹500.",
      events: s.filter((e) => matchesPrice(e, "under500")),
      href: "/events?price=under500",
    },
    {
      id: "free",
      kicker: "Free Entry",
      title: "Just show up",
      blurb: "Free entry, confirmed with the organizer.",
      events: s.filter((e) => e.price.status === "free"),
      href: "/events?price=free",
    },
    {
      id: "community",
      kicker: "Community",
      title: "Society lawns & neighbourhood circles",
      blurb: "RWA garbas and community nights — where most of NCR actually dances.",
      events: s.filter((e) => e.types.includes("community") || e.types.includes("society_rwa")),
      href: "/events?type=community,society_rwa",
    },
  ];
  return sections.filter((x) => x.events.length >= MIN_SECTION);
}

export interface AreaSummary {
  area: Area;
  count: number;
  localities: { name: string; count: number }[];
}

export function areaSummaries(events: EventRecord[]): AreaSummary[] {
  return AREAS.map((area) => {
    const inArea = events.filter((e) => e.venue.area === area);
    const loc = new Map<string, number>();
    inArea.forEach((e) => loc.set(e.venue.locality, (loc.get(e.venue.locality) ?? 0) + 1));
    return {
      area,
      count: inArea.length,
      localities: [...loc.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    };
  });
}

export function countByDate(events: EventRecord[]) {
  const m: Record<string, number> = {};
  for (const d of NAVRATRI_DAYS) m[d.date] = events.filter((e) => onDate(e, d.date)).length;
  return m;
}

/** Lightweight index for the client-side search overlay. */
export interface SearchItem {
  slug: string;
  title: string;
  venue: string;
  locality: string;
  area: Area;
  organizer: string | null;
  dates: string[];
  price: string;
  isDemo: boolean;
  seed: string;
  type: EventType | null;
}

/** Human headline for a filter combination — used for page titles, metadata and share text. */
export function describeFilters(f: Filters): { title: string; accent: string | null; description: string } {
  const bits: string[] = [];
  const typeLabel = f.type.length === 1 ? EVENT_TYPE_META_PLURAL[f.type[0]] : null;
  const where = f.locality ? f.locality : f.area ? AREA_META[f.area].label : null;
  const price = f.price ? PRICE_BUCKETS.find((b) => b.id === f.price)!.label : null;
  const day = f.date ? formatDayLong(f.date) : null;

  const title = typeLabel ?? (price === "Free entry" ? "Free entry" : "Navratri events");
  if (where) bits.push(`in ${where}`);
  if (day) bits.push(`on ${day}`);
  if (price && price !== "Free entry") bits.push(price.toLowerCase().replace("under", "under"));
  if (f.q) bits.push(`matching “${f.q}”`);
  const accent = bits.length ? bits.join(" ") : where ? null : "across NCR";
  const description = `${title} ${accent ?? ""}`.trim() + " — garba, dandiya and Navratri nights with verified dates, prices and entry rules.";
  return { title, accent, description };
}

export const EVENT_TYPE_META_PLURAL: Record<EventType, string> = {
  garba: "Garba nights",
  dandiya: "Dandiya nights",
  bollywood: "Bollywood nights",
  dj_edm: "DJ & EDM nights",
  ticketed: "Big ticketed nights",
  community: "Community events",
  society_rwa: "Society & RWA events",
};

function formatDayLong(date: string) {
  const [, m, d] = date.split("-").map(Number);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(2026, m - 1, d)).getUTCDay()];
  return `${wd} ${d} Oct`;
}

export type SortKey = "recommended" | "soonest" | "price";

export function sortBy(events: EventRecord[], key: SortKey, date: string | null) {
  if (key === "soonest") return [...events].sort((a, b) => firstDate(a, date).localeCompare(firstDate(b, date)) || a.title.localeCompare(b.title));
  if (key === "price") {
    const v = (e: EventRecord) => (e.price.status === "free" ? 0 : e.price.status === "paid" && e.price.minInr != null ? e.price.minInr : Number.POSITIVE_INFINITY);
    return [...events].sort((a, b) => v(a) - v(b) || a.title.localeCompare(b.title));
  }
  return sortEvents(events, date);
}
