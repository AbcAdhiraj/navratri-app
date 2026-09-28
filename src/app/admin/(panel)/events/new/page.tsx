import Link from "next/link";
import { EventEditor } from "@/components/admin/EventEditor";
import { blankEvent, eventFromSubmission } from "@/lib/admin/blank";
import { getRepo } from "@/lib/data";

export default async function NewEvent({ searchParams }: PageProps<"/admin/events/new">) {
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : null;
  const repo = getRepo();
  const [all, sub] = await Promise.all([repo.adminListEvents(), from ? repo.adminGetSubmission(from) : null]);
  const isDemo = repo.mode === "fixtures";
  const initial = sub && sub.kind === "new_event" ? eventFromSubmission(sub, isDemo) : blankEvent(isDemo);
  return (
    <div className="grid gap-6">
      <div>
        <Link href={sub ? `/admin/submissions/${sub.id}` : "/admin/events"} className="text-sm font-bold underline">
          ← {sub ? "Back to submission" : "Events"}
        </Link>
        <h1 className="t-h1 mt-3 !text-5xl">{sub ? "Create from submission" : "New event"}</h1>
        {sub && <p className="t-meta mt-2 text-ink-soft">Pre-filled from the suggestion. Nothing is marked verified — check every detail against a primary source.</p>}
      </div>
      <EventEditor initial={initial} all={all} fromSubmissionId={sub?.id ?? null} isNew />
    </div>
  );
}
