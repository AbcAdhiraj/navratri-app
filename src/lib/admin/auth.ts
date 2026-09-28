import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepo } from "../data";
import { createSessionClient } from "../supabase/server";
import type { Actor } from "../data/repo";

export const DEMO_COOKIE = "navratri_admin_demo";

export interface AdminUser extends Actor {
  role: "admin" | "editor";
  mode: "supabase" | "fixtures";
}

export function demoToken(password: string) {
  return createHash("sha256").update(`navratri-ncr:${password}`).digest("hex");
}

/** In fixture mode the admin is open in local development, or behind ADMIN_DEMO_PASSWORD on previews. */
export function demoAdminAccess(): "open" | "password" | "closed" {
  if (process.env.NODE_ENV !== "production") return "open";
  return process.env.ADMIN_DEMO_PASSWORD ? "password" : "closed";
}

export async function getAdmin(): Promise<AdminUser | null> {
  const mode = getRepo().mode;
  if (mode === "unconfigured") return null;

  if (mode === "fixtures") {
    const access = demoAdminAccess();
    if (access === "open") return { id: null, label: "Local admin (demo)", role: "admin", mode };
    if (access === "password") {
      const got = (await cookies()).get(DEMO_COOKIE)?.value ?? "";
      const want = demoToken(process.env.ADMIN_DEMO_PASSWORD!);
      if (got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want))) return { id: null, label: "Preview admin (demo)", role: "admin", mode };
    }
    return null;
  }

  const db = await createSessionClient();
  const { data } = await db.auth.getUser();
  if (!data.user) return null;
  const { data: role } = await db.from("admin_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!role) return null;
  return { id: data.user.id, label: data.user.email ?? data.user.id, role: role.role, mode };
}

export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}
