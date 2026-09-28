import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/layout/Logo";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/data";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pending = (await getRepo().adminListSubmissions()).filter((s) => s.status === "pending").length;
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <LogoMark className="size-7" />
            Admin
          </Link>
          <AdminNav pending={pending} />
          <div className="ml-auto flex items-center gap-3 text-sm">
            {admin.mode === "fixtures" && <span className="rounded-md border-[1.5px] border-dashed border-ink bg-haldi px-2 py-0.5 text-[0.65rem] font-extrabold tracking-widest">DEMO DATA · IN-MEMORY</span>}
            <span className="hidden text-ink-soft sm:inline">{admin.label}</span>
            <Link href="/" className="font-bold underline underline-offset-2">
              View site
            </Link>
            <form action={logoutAction}>
              <button className="btn btn-outline btn-sm">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
