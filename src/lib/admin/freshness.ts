import type { EventRecord } from "../types";

const WEEK = 7 * 86400000;

/** Published events whose details haven't been re-checked in a week. */
export function staleEvents(events: EventRecord[], now = Date.now()) {
  return events.filter((e) => e.status === "published" && (!e.verification.lastCheckedAt || now - Date.parse(e.verification.lastCheckedAt) > WEEK));
}
