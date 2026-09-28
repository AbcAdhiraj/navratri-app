import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EventRecord,
  ModerationDecision,
  Revision,
  Submission,
} from "../types";
import type { Actor, NewSubmission, Repository } from "./repo";
import { createPublicClient, createServiceClient, createSessionClient } from "../supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const EVENT_SELECT =
  "*, venue:venues(*), occurrences:event_occurrences(*), sources:event_sources(*), vibes:event_vibes(*), media:event_media(*)";

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : null);

function toEvent(r: Row, crowd: Row | undefined): EventRecord {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status,
    isDemo: r.is_demo,
    tagline: r.tagline,
    description: r.description,
    types: r.types ?? [],
    music: r.music ?? [],
    vibes: (r.vibes ?? []).map((v: Row) => ({ tag: v.tag, evidence: v.evidence, sourceId: v.source_id })),
    organizer: r.organizer_name ? { name: r.organizer_name, url: r.organizer_url } : null,
    venue: {
      id: r.venue.id,
      name: r.venue.name,
      address: r.venue.address,
      locality: r.venue.locality,
      area: r.venue.area,
    },
    occurrences: (r.occurrences ?? [])
      .map((o: Row) => ({ date: o.date, startTime: hhmm(o.start_time), endTime: hhmm(o.end_time), note: o.note }))
      .sort((a: Row, b: Row) => a.date.localeCompare(b.date)),
    price: { status: r.price_status, minInr: r.price_min_inr, maxInr: r.price_max_inr, note: r.price_note },
    entry: {
      couplesOnly: r.entry_couples_only,
      groupsAllowed: r.entry_groups_allowed,
      stagsAllowed: r.entry_stags_allowed,
      familiesWelcome: r.entry_families_welcome,
      minAge: r.entry_min_age,
      dressCode: r.entry_dress_code,
      note: r.entry_note,
    },
    food: { available: r.food_available, vegetarianOnly: r.food_vegetarian_only, note: r.food_note },
    booking: r.booking_url
      ? { url: r.booking_url, platform: r.booking_platform ?? "Booking", verified: r.booking_verified }
      : null,
    sources: (r.sources ?? []).map((s: Row) => ({
      id: s.id,
      kind: s.kind,
      label: s.label,
      url: s.url,
      checkedAt: s.checked_at,
    })),
    media: (r.media ?? [])
      .sort((a: Row, b: Row) => a.sort - b.sort)
      .map((m: Row) => ({
        id: m.id,
        url: m.url,
        alt: m.alt,
        credit: m.credit,
        year: m.year,
        width: m.width,
        height: m.height,
      })),
    crowd: crowd
      ? {
          editionLabel: crowd.edition_label,
          womenPctLow: crowd.women_pct_low,
          womenPctHigh: crowd.women_pct_high,
          reportCount: crowd.report_count,
        }
      : null,
    verification: {
      dateChecked: r.verified_date,
      priceChecked: r.verified_price,
      entryChecked: r.verified_entry,
      lastCheckedAt: r.last_checked_at,
    },
    featured: r.featured,
    scale: r.scale,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function eventRow(e: EventRecord, venueId: string): Row {
  return {
    slug: e.slug,
    title: e.title,
    status: e.status,
    is_demo: e.isDemo,
    tagline: e.tagline,
    description: e.description,
    types: e.types,
    music: e.music,
    organizer_name: e.organizer?.name ?? null,
    organizer_url: e.organizer?.url ?? null,
    venue_id: venueId,
    price_status: e.price.status,
    price_min_inr: e.price.status === "paid" ? e.price.minInr : null,
    price_max_inr: e.price.status === "paid" ? e.price.maxInr : null,
    price_note: e.price.note,
    entry_couples_only: e.entry.couplesOnly,
    entry_groups_allowed: e.entry.groupsAllowed,
    entry_stags_allowed: e.entry.stagsAllowed,
    entry_families_welcome: e.entry.familiesWelcome,
    entry_min_age: e.entry.minAge,
    entry_dress_code: e.entry.dressCode,
    entry_note: e.entry.note,
    food_available: e.food.available,
    food_vegetarian_only: e.food.vegetarianOnly,
    food_note: e.food.note,
    booking_url: e.booking?.url ?? null,
    booking_platform: e.booking?.platform ?? null,
    booking_verified: e.booking?.verified ?? false,
    verified_date: e.verification.dateChecked,
    verified_price: e.verification.priceChecked,
    verified_entry: e.verification.entryChecked,
    last_checked_at: e.verification.lastCheckedAt,
    featured: e.featured,
    scale: e.scale,
    published_at: e.status === "published" ? new Date().toISOString() : null,
  };
}

async function withCrowd(client: SupabaseClient, rows: Row[]): Promise<EventRecord[]> {
  if (rows.length === 0) return [];
  const { data: crowd } = await client
    .from("crowd_summary")
    .select("*")
    .in(
      "event_id",
      rows.map((r) => r.id),
    );
  const latest = new Map<string, Row>();
  for (const c of crowd ?? []) {
    const prev = latest.get(c.event_id);
    if (!prev || c.edition_year > prev.edition_year) latest.set(c.event_id, c);
  }
  return rows.map((r) => toEvent(r, latest.get(r.id)));
}

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function toSubmission(r: Row): Submission {
  return {
    id: r.id,
    kind: r.kind,
    status: r.status,
    eventId: r.event_id,
    eventSlug: r.event?.slug ?? null,
    payload: r.payload ?? {},
    evidenceUrls: r.evidence_urls ?? [],
    evidenceFiles: r.evidence_paths ?? [],
    contactEmail: r.contact_email,
    submitterNote: r.submitter_note,
    createdAt: r.created_at,
  };
}

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export function createSupabaseRepo(): Repository {
  const pub = createPublicClient();

  return {
    mode: "supabase",

    async listPublished() {
      const rows = must(await pub.from("events").select(EVENT_SELECT).eq("status", "published"));
      return withCrowd(pub, rows as Row[]);
    },

    async getPublishedBySlug(slug) {
      const row = must(await pub.from("events").select(EVENT_SELECT).eq("slug", slug).eq("status", "published").maybeSingle());
      if (!row) return null;
      return (await withCrowd(pub, [row as Row]))[0];
    },

    async createSubmission(input: NewSubmission, files: File[] = []) {
      const id = crypto.randomUUID();
      const paths: string[] = [];
      const service = createServiceClient();
      if (service) {
        for (const f of files) {
          const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
          const path = `${id}/${Date.now()}-${safe}`;
          const { error } = await service.storage.from("evidence").upload(path, f, { contentType: f.type, upsert: false });
          if (!error) paths.push(path);
        }
      }
      must(
        await pub.from("submissions").insert({
          id,
          kind: input.kind,
          event_id: input.eventId,
          payload: input.payload,
          evidence_urls: input.evidenceUrls,
          evidence_paths: paths,
          contact_email: input.contactEmail,
          submitter_note: input.submitterNote,
        }),
      );
      return { id };
    },

    async adminListEvents() {
      const db = await createSessionClient();
      const rows = must(await db.from("events").select(EVENT_SELECT).order("updated_at", { ascending: false }));
      return withCrowd(db, rows as Row[]);
    },

    async adminGetEvent(id) {
      const db = await createSessionClient();
      const row = must(await db.from("events").select(EVENT_SELECT).eq("id", id).maybeSingle());
      return row ? (await withCrowd(db, [row as Row]))[0] : null;
    },

    async adminSaveEvent(e, actor: Actor, submissionId = null) {
      const db = await createSessionClient();
      const before = isUuid(e.id) ? await this.adminGetEvent(e.id) : null;

      const venue = must(
        await db
          .from("venues")
          .upsert(
            { name: e.venue.name, address: e.venue.address, locality: e.venue.locality, area: e.venue.area },
            { onConflict: "name,locality,area" },
          )
          .select("id")
          .single(),
      ) as Row;

      const row = eventRow(e, venue.id);
      if (before?.status === "published" && e.status === "published") delete row.published_at;
      const saved = must(
        before
          ? await db.from("events").update(row).eq("id", e.id).select("id").single()
          : await db.from("events").insert({ ...row, created_by: actor.id }).select("id").single(),
      ) as Row;
      const eventId: string = saved.id;

      // Replace child collections.
      for (const t of ["event_vibes", "event_occurrences", "event_sources", "event_media"]) {
        must(await db.from(t).delete().eq("event_id", eventId));
      }
      const sourceIds = new Map<string, string>();
      const sources = e.sources.map((s) => {
        const id = isUuid(s.id) ? s.id : crypto.randomUUID();
        sourceIds.set(s.id, id);
        return { id, event_id: eventId, kind: s.kind, label: s.label, url: s.url, checked_at: s.checkedAt };
      });
      if (sources.length) must(await db.from("event_sources").insert(sources));
      if (e.occurrences.length)
        must(
          await db.from("event_occurrences").insert(
            e.occurrences.map((o) => ({ event_id: eventId, date: o.date, start_time: o.startTime, end_time: o.endTime, note: o.note })),
          ),
        );
      if (e.vibes.length)
        must(
          await db.from("event_vibes").insert(
            e.vibes.map((v) => ({
              event_id: eventId,
              tag: v.tag,
              evidence: v.evidence,
              source_id: v.sourceId ? (sourceIds.get(v.sourceId) ?? null) : null,
            })),
          ),
        );
      if (e.media.length)
        must(
          await db.from("event_media").insert(
            e.media.map((m, i) => ({
              event_id: eventId,
              url: m.url,
              alt: m.alt,
              credit: m.credit,
              year: m.year,
              width: m.width,
              height: m.height,
              authorized: true,
              sort: i,
            })),
          ),
        );

      const after = (await this.adminGetEvent(eventId))!;
      must(
        await db.from("revisions").insert({
          event_id: eventId,
          before,
          after,
          actor: actor.id,
          actor_label: actor.label,
          submission_id: submissionId,
        }),
      );
      must(
        await db.from("moderation_decisions").insert({
          event_id: eventId,
          submission_id: submissionId,
          action: "edit",
          note: before ? "Edited" : "Created",
          actor: actor.id,
          actor_label: actor.label,
        }),
      );
      return after;
    },

    async adminListSubmissions() {
      const db = await createSessionClient();
      const rows = must(await db.from("submissions").select("*, event:events(slug)").order("created_at", { ascending: false }));
      return (rows as Row[]).map(toSubmission);
    },

    async adminGetSubmission(id) {
      const db = await createSessionClient();
      const row = must(await db.from("submissions").select("*, event:events(slug)").eq("id", id).maybeSingle());
      return row ? toSubmission(row as Row) : null;
    },

    async adminDecide(submissionId, action, note, actor) {
      const db = await createSessionClient();
      const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "duplicate";
      const sub = must(await db.from("submissions").update({ status }).eq("id", submissionId).select("event_id").single()) as Row;
      must(
        await db.from("moderation_decisions").insert({
          submission_id: submissionId,
          event_id: sub.event_id,
          action,
          note,
          actor: actor.id,
          actor_label: actor.label,
        }),
      );
    },

    async adminListDecisions(limit = 50) {
      const db = await createSessionClient();
      const rows = must(await db.from("moderation_decisions").select("*").order("created_at", { ascending: false }).limit(limit));
      return (rows as Row[]).map(
        (r): ModerationDecision => ({
          id: r.id,
          submissionId: r.submission_id,
          eventId: r.event_id,
          action: r.action,
          note: r.note,
          actor: r.actor_label ?? r.actor ?? "unknown",
          createdAt: r.created_at,
        }),
      );
    },

    async adminListRevisions(eventId) {
      const db = await createSessionClient();
      const rows = must(await db.from("revisions").select("*").eq("event_id", eventId).order("created_at", { ascending: false }));
      return (rows as Row[]).map(
        (r): Revision => ({
          id: r.id,
          eventId: r.event_id,
          before: r.before,
          after: r.after,
          actor: r.actor_label ?? r.actor ?? "unknown",
          submissionId: r.submission_id,
          createdAt: r.created_at,
        }),
      );
    },

    async adminEvidenceUrl(path) {
      const db = await createSessionClient();
      const { data } = await db.storage.from("evidence").createSignedUrl(path, 600);
      return data?.signedUrl ?? null;
    },
  };
}
