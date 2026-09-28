import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/layout/Logo";
import { demoAdminAccess, getAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin");
  const repoMode = getRepo().mode;
  const mode = repoMode === "supabase" ? "supabase" : repoMode === "fixtures" ? demoAdminAccess() : "closed";
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card p-8 shadow-[var(--shadow-print-lg)]">
        <LogoMark className="size-10" />
        <h1 className="t-h2 mt-5 !text-3xl">Moderator sign in</h1>
        <p className="t-meta mb-6 mt-2 text-ink-soft">{repoMode === "fixtures" ? "Demo mode: edits live in memory and reset on restart." : "Access is limited to accounts listed in admin_roles."}</p>
        <LoginForm mode={mode} />
      </div>
    </main>
  );
}
