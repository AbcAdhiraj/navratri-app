"use server";

import { getRepo } from "@/lib/data";
import type { SubmissionPayload } from "@/lib/types";
import { validateSubmission, type Errors, type SubmissionInput } from "@/lib/validate";

export type SubmitResult = { ok: true; id: string } | { ok: false; message: string; errors?: Errors };

/** Everything lands in moderation as `pending` — nothing here touches published data. */
export async function submitToModeration(fd: FormData): Promise<SubmitResult> {
  // Honeypot: real people never fill this hidden field.
  if (String(fd.get("website") ?? "")) return { ok: true, id: "received" };

  let input: SubmissionInput;
  try {
    const raw = JSON.parse(String(fd.get("data") ?? "{}"));
    input = {
      kind: raw.kind === "correction" ? "correction" : "new_event",
      eventSlug: typeof raw.eventSlug === "string" ? raw.eventSlug.slice(0, 120) : null,
      payload: (raw.payload ?? {}) as SubmissionPayload,
      links: Array.isArray(raw.links) ? raw.links.map(String).slice(0, 5) : [],
      email: String(raw.email ?? "").slice(0, 200),
      note: String(raw.note ?? ""),
    };
  } catch {
    return { ok: false, message: "We couldn’t read that submission. Please try again." };
  }

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const errors = validateSubmission(input, files.map((f) => ({ size: f.size, type: f.type })));
  if (Object.keys(errors).length) return { ok: false, message: "A few details need fixing.", errors };

  const repo = getRepo();
  let eventId: string | null = null;
  if (input.kind === "correction" && input.eventSlug) {
    const ev = await repo.getPublishedBySlug(input.eventSlug);
    if (!ev) return { ok: false, message: "That listing no longer exists.", errors: { event: "Listing not found." } };
    eventId = ev.id;
  }

  try {
    const { id } = await repo.createSubmission(
      {
        kind: input.kind,
        eventId,
        eventSlug: input.eventSlug,
        payload: input.payload,
        evidenceUrls: input.links.map((l) => l.trim()).filter(Boolean),
        evidenceFiles: [],
        contactEmail: input.email || null,
        submitterNote: input.note || null,
      },
      files,
    );
    return { ok: true, id };
  } catch (err) {
    console.error("[navratri] submission failed", err);
    return { ok: false, message: "Something went sideways sending that. Please try again in a moment." };
  }
}
