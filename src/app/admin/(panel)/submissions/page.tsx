import Link from "next/link";
import { StatusBadge, when } from "@/components/admin/ui";
import { getRepo } from "@/lib/data";
import { SUBMISSION_STATUSES } from "@/lib/types";

export default async function AdminSubmissions({ searchParams }: PageProps<"/admin/submissions">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "pending";
  const all = await getRepo().adminListSubmissions();
  const list = all.filter((s) => status === "all" || s.status === status);
  return (
    <div className="grid gap-6">
      <h1 className="t-h1 !text-5xl">Submissions</h1>
      <div className="flex flex-wrap gap-2">
        {[...SUBMISSION_STATUSES, "all"].map((s) => (
          <Link key={s} href={`/admin/submissions?status=${s}`} className="chip capitalize" data-active={status === s}>
            {s} <span className="opacity-60">{s === "all" ? all.length : all.filter((x) => x.status === s).length}</span>
          </Link>
        ))}
      </div>
      <ul className="grid gap-2">
        {list.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/submissions/${s.id}`} className="flex items-center gap-4 rounded-2xl border-[1.5px] border-ink/15 bg-card px-5 py-4 transition-colors hover:border-ink">
              <span className="rounded-md bg-paper-2 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider">{s.kind === "correction" ? "Correction" : "New event"}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{s.kind === "correction" ? s.eventSlug : s.payload.title}</span>
                <span className="t-meta block truncate text-ink-soft">
                  {s.kind === "correction" ? s.payload.details : [s.payload.locality, s.payload.area].filter(Boolean).join(", ")} · {s.evidenceUrls.length + s.evidenceFiles.length} evidence item(s)
                </span>
              </span>
              <span className="hidden text-xs text-ink-faint sm:block">{when(s.createdAt)}</span>
              <StatusBadge status={s.status} />
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl border-[1.5px] border-dashed border-ink/20 p-8 text-center text-sm text-ink-soft">Nothing here.</li>}
      </ul>
    </div>
  );
}
