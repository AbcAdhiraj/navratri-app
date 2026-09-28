"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, demoAdminAccess, demoToken, requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/data";
import { createSessionClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/lib/types";
import { validateEvent, type Errors } from "@/lib/validate";

export type LoginState = { error: string | null };

export async function loginAction(_: LoginState, fd: FormData): Promise<LoginState> {
  const mode = getRepo().mode;
  if (mode === "supabase") {
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return { error: "Email and password are required." };
    const db = await createSessionClient();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { error: "Those credentials didn’t work." };
    redirect("/admin");
  }
  if (mode === "fixtures" && demoAdminAccess() === "password") {
    const password = String(fd.get("password") ?? "");
    if (password !== process.env.ADMIN_DEMO_PASSWORD) return { error: "Wrong password." };
    (await cookies()).set(DEMO_COOKIE, demoToken(password), { httpOnly: true, sameSite: "lax", secure: true, path: "/admin", maxAge: 60 * 60 * 8 });
    redirect("/admin");
  }
  if (mode === "fixtures" && demoAdminAccess() === "open") redirect("/admin");
  return { error: "Admin isn’t available on this deployment." };
}

export async function logoutAction() {
  if (getRepo().mode === "supabase") {
    const db = await createSessionClient();
    await db.auth.signOut();
  }
  (await cookies()).delete(DEMO_COOKIE);
  redirect("/admin/login");
}

export type SaveResult = { ok: false; errors: Errors; message: string } | { ok: true };

export async function saveEventAction(json: string, fromSubmissionId: string | null): Promise<SaveResult> {
  const admin = await requireAdmin();
  let event: EventRecord;
  try {
    event = JSON.parse(json);
  } catch {
    return { ok: false, errors: {}, message: "Couldn’t read the form." };
  }
  const errors = validateEvent(event);
  if (Object.keys(errors).length) return { ok: false, errors, message: "Fix the highlighted fields." };

  const repo = getRepo();
  const all = await repo.adminListEvents();
  if (all.some((e) => e.slug === event.slug && e.id !== event.id)) return { ok: false, errors: { slug: "Another event already uses this slug." }, message: "Slug must be unique." };

  let saved: EventRecord;
  try {
    saved = await repo.adminSaveEvent(event, admin, fromSubmissionId);
    if (fromSubmissionId) await repo.adminDecide(fromSubmissionId, "approve", `Applied to “${saved.title}” (${saved.slug})`, admin);
  } catch (err) {
    console.error("[navratri] save failed", err);
    return { ok: false, errors: {}, message: err instanceof Error ? err.message : "Save failed." };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/events/${saved.id}?saved=1`);
}

export async function decideAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("submissionId") ?? "");
  const action = String(fd.get("action") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 1000) || null;
  const duplicateOf = String(fd.get("duplicateOf") ?? "");
  if (!id || !["reject", "mark_duplicate"].includes(action)) throw new Error("Invalid decision");
  const fullNote = action === "mark_duplicate" && duplicateOf ? `Duplicate of ${duplicateOf}${note ? ` — ${note}` : ""}` : note;
  await getRepo().adminDecide(id, action as "reject" | "mark_duplicate", fullNote, admin);
  revalidatePath("/admin", "layout");
  redirect(`/admin/submissions/${id}?decided=1`);
}
