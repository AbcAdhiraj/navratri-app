import type { EventRecord, ModerationDecision, Revision, Submission } from "../types";

export type NewSubmission = Omit<Submission, "id" | "status" | "createdAt">;

export interface Actor {
  id: string | null;
  label: string;
}

/** Storage-agnostic data access. Implemented by the fixture (memory) and Supabase repositories. */
export interface Repository {
  readonly mode: "fixtures" | "supabase" | "unconfigured";

  // Public
  listPublished(): Promise<EventRecord[]>;
  getPublishedBySlug(slug: string): Promise<EventRecord | null>;
  createSubmission(input: NewSubmission, files?: File[]): Promise<{ id: string }>;

  // Admin (callers must already be authorised; Supabase additionally enforces RLS)
  adminListEvents(): Promise<EventRecord[]>;
  adminGetEvent(id: string): Promise<EventRecord | null>;
  adminSaveEvent(event: EventRecord, actor: Actor, submissionId?: string | null): Promise<EventRecord>;
  adminListSubmissions(): Promise<Submission[]>;
  adminGetSubmission(id: string): Promise<Submission | null>;
  adminDecide(
    submissionId: string,
    action: "approve" | "reject" | "mark_duplicate",
    note: string | null,
    actor: Actor,
  ): Promise<void>;
  adminListDecisions(limit?: number): Promise<ModerationDecision[]>;
  adminListRevisions(eventId: string): Promise<Revision[]>;
  adminEvidenceUrl(path: string): Promise<string | null>;
}
