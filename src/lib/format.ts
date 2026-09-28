import { AREA_META } from "./constants";
import type { EventRecord, Occurrence, Price } from "./types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse YYYY-MM-DD as a calendar date (no timezone drift). */
export function parseDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { y, m, d, weekday: WEEKDAYS[dt.getUTCDay()], month: MONTHS[m - 1] };
}

export function formatDay(date: string, opts: { weekday?: boolean } = {}) {
  const p = parseDay(date);
  return `${opts.weekday ? `${p.weekday}, ` : ""}${p.d} ${p.month}`;
}

export function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${suffix}` : `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(o: Pick<Occurrence, "startTime" | "endTime">) {
  const s = formatTime(o.startTime);
  const e = formatTime(o.endTime);
  if (s && e) return `${s} – ${e}`;
  if (s) return `From ${s}`;
  return "Time not confirmed";
}

export function formatDateRange(occ: Occurrence[]) {
  if (occ.length === 0) return "Dates not confirmed";
  const dates = [...occ].map((o) => o.date).sort();
  if (dates.length === 1) return formatDay(dates[0], { weekday: true });
  const a = parseDay(dates[0]);
  const b = parseDay(dates[dates.length - 1]);
  const contiguous = dates.length === b.d - a.d + 1 && a.m === b.m;
  if (contiguous) return `${a.d}–${b.d} ${b.month} · ${dates.length} nights`;
  return `${dates.length} nights · from ${a.d} ${a.month}`;
}

export function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Never render ₹0 unless free entry is verified; unknown stays unknown. */
export function priceLabel(p: Price, style: "short" | "long" = "short") {
  if (p.status === "free") return style === "long" ? "Free entry (verified)" : "Free";
  if (p.status === "paid" && p.minInr != null) {
    if (style === "long" && p.maxInr != null && p.maxInr !== p.minInr) return `${inr(p.minInr)} – ${inr(p.maxInr)}`;
    return `${inr(p.minInr)} onwards`;
  }
  if (p.status === "paid") return "Paid · price TBC";
  return "Price unknown";
}

export function locationLabel(e: EventRecord) {
  return `${e.venue.locality}, ${AREA_META[e.venue.area].label}`;
}

export function relativeChecked(iso: string | null) {
  if (!iso) return "Not yet checked";
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Today's date in Asia/Kolkata as YYYY-MM-DD. */
export function todayIST(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  return ist.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
