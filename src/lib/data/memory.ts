import type { EventRecord, ModerationDecision, Revision, Submission } from "../types";
import { buildFixtures } from "./fixtures";
import type { Actor, NewSubmission, Repository } from "./repo";

interface Store {
  events: EventRecord[];
  submissions: Submission[];
  decisions: ModerationDecision[];
  revisions: Revision[];
}

const g = globalThis as unknown as { __navratriStore?: Store };

function store(): Store {
  if (!g.__navratriStore) {
    const events = buildFixtures();
    g.__navratriStore = {
      events,
      submissions: [
        {
          id: "sub-demo-1",
          kind: "correction",
          status: "pending",
          eventId: events[1].id,
          eventSlug: events[1].slug,
          payload: { fields: ["Time"], details: "DEMO correction: aarti now starts at 7:15 PM, garba at 7:45 PM." },
          evidenceUrls: ["https://example.com/demo/notice-board-photo"],
          evidenceFiles: [],
          contactEmail: null,
          submitterNote: null,
          createdAt: "2026-09-27T12:00:00Z",
        },
        {
          id: "sub-demo-2",
          kind: "new_event",
          status: "pending",
          eventId: null,
          eventSlug: null,
          payload: {
            title: "DEMO — Midnight Garba Nights",
            area: "gurugram",
            locality: "Golf Course Road",
            venueName: "Demo Grand Lawns",
            dates: ["2026-10-17", "2026-10-18"],
            startTime: "20:00",
            priceStatus: "paid",
            priceMin: 799,
            types: ["garba", "dj_edm"],
            organizerName: "Demo Golf Course Road Collective",
          },
          evidenceUrls: ["https://example.com/demo/poster"],
          evidenceFiles: [],
          contactEmail: "demo@example.com",
          submitterNote: "DEMO submission — likely a duplicate of an existing listing.",
          createdAt: "2026-09-27T15:30:00Z",
        },
      ],
      decisions: [],
      revisions: [],
    };
  }
  return g.__navratriStore;
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
const clone = <T,>(v: T): T => structuredClone(v);

export function createMemoryRepo(): Repository {
  return {
    mode: "fixtures",
    async listPublished() {
      return clone(store().events.filter((e) => e.status === "published"));
    },
    async getPublishedBySlug(slug) {
      const e = store().events.find((x) => x.slug === slug && x.status === "published");
      return e ? clone(e) : null;
    },
    async createSubmission(input: NewSubmission, files?: File[]) {
      const id = uid("sub");
      store().submissions.unshift({
        ...input,
        evidenceFiles: [...input.evidenceFiles, ...(files ?? []).map((f) => `(demo, not stored) ${f.name}`)],
        id,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      return { id };
    },
    async adminListEvents() {
      return clone(store().events);
    },
    async adminGetEvent(id) {
      const e = store().events.find((x) => x.id === id);
      return e ? clone(e) : null;
    },
    async adminSaveEvent(event, actor: Actor, submissionId = null) {
      const s = store();
      const idx = s.events.findIndex((x) => x.id === event.id);
      const before = idx >= 0 ? clone(s.events[idx]) : null;
      const now = new Date().toISOString();
      const saved: EventRecord = { ...clone(event), id: event.id || uid("evt"), updatedAt: now, createdAt: before?.createdAt ?? now };
      if (idx >= 0) s.events[idx] = saved;
      else s.events.unshift(saved);
      s.revisions.unshift({ id: uid("rev"), eventId: saved.id, before, after: clone(saved), actor: actor.label, submissionId, createdAt: now });
      s.decisions.unshift({ id: uid("dec"), submissionId, eventId: saved.id, action: "edit", note: before ? "Edited" : "Created", actor: actor.label, createdAt: now });
      return clone(saved);
    },
    async adminListSubmissions() {
      return clone(store().submissions);
    },
    async adminGetSubmission(id) {
      const s = store().submissions.find((x) => x.id === id);
      return s ? clone(s) : null;
    },
    async adminDecide(submissionId, action, note, actor) {
      const s = store();
      const sub = s.submissions.find((x) => x.id === submissionId);
      if (!sub) throw new Error("Submission not found");
      sub.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "duplicate";
      s.decisions.unshift({ id: uid("dec"), submissionId, eventId: sub.eventId, action, note, actor: actor.label, createdAt: new Date().toISOString() });
    },
    async adminListDecisions(limit = 50) {
      return clone(store().decisions.slice(0, limit));
    },
    async adminListRevisions(eventId) {
      return clone(store().revisions.filter((r) => r.eventId === eventId));
    },
    async adminEvidenceUrl() {
      return null;
    },
  };
}

/** Serves nothing — used when a production deployment has no database configured. */
export function createEmptyRepo(): Repository {
  const none = async () => [];
  const nil = async () => null;
  const refuse = async (): Promise<never> => {
    throw new Error("Data source not configured");
  };
  return {
    mode: "unconfigured",
    listPublished: none,
    getPublishedBySlug: nil,
    createSubmission: refuse,
    adminListEvents: none,
    adminGetEvent: nil,
    adminSaveEvent: refuse,
    adminListSubmissions: none,
    adminGetSubmission: nil,
    adminDecide: refuse,
    adminListDecisions: none,
    adminListRevisions: none,
    adminEvidenceUrl: nil,
  };
}
