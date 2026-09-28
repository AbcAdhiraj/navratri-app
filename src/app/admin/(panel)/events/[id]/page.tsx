import Link from "next/link";
import { notFound } from "next/navigation";
import { EventEditor } from "@/components/admin/EventEditor";
import { Panel, StatusBadge, when } from "@/components/admin/ui";
import { diffEvents } from "@/lib/admin/diff";
import { getRepo } from "@/lib/data";

export default async function EditEvent({ params, searchParams }: PageProps<"/admin/events/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const repo = getRepo();
  const [ev, all, revisions] = await Promise.all([repo.adminGetEvent(id), repo.adminListEvents(), repo.adminListRevisions(id)]);
  if (!ev) notFound();
  const from = typeof sp.from === "string" ? sp.from : null;
  const sub = from ? await repo.adminGetSubmission(from) : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/events" className="text-sm font-bold underline">
            ← Events
          </Link>
          <h1 className="t-h1 mt-3 !text-4xl">{ev.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <StatusBadge status={ev.status} /> /events/{ev.slug} · updated {when(ev.updatedAt)}
          </p>
        </div>
        {ev.status === "published" && (
          <Link href={`/events/${ev.slug}`} target="_blank" className="btn btn-outline btn-sm">
            View public page ↗
          </Link>
        )}
      </div>
      {sp.saved && <p className="rounded-2xl border-[1.5px] border-ink bg-mehendi-soft px-4 py-3 text-sm font-bold">Saved. A revision was recorded{from ? " and the submission approved" : ""}.</p>}
      {sub && sub.kind === "correction" && (
        <Panel title="Correction being applied">
          <p className="text-sm">
            <b>Fields:</b> {(sub.payload.fields ?? []).join(", ")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{sub.payload.details}</p>
          <p className="mt-2 text-xs text-ink-soft">Evidence: {sub.evidenceUrls.join(", ") || "files only — see submission"}</p>
        </Panel>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <EventEditor key={ev.updatedAt} initial={ev} all={all} fromSubmissionId={sub?.status === "pending" ? sub.id : null} isNew={false} />
        <aside className="grid content-start gap-4">
          <Panel title={`Revisions (${revisions.length})`}>
            {revisions.length === 0 ? (
              <p className="text-sm text-ink-soft">No revisions recorded yet.</p>
            ) : (
              <ol className="grid gap-4">
                {revisions.map((r) => {
                  const d = diffEvents(r.before, r.after);
                  return (
                    <li key={r.id} className="text-sm">
                      <p className="font-bold">
                        {r.before ? "Edited" : "Created"} · {when(r.createdAt)}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {r.actor}
                        {r.submissionId ? " · from submission" : ""}
                      </p>
                      {r.before && (
                        <details className="mt-1.5">
                          <summary className="text-xs font-bold underline">{d.length} field(s) changed</summary>
                          <table className="mt-2 w-full text-xs">
                            <tbody>
                              {d.map((c) => (
                                <tr key={c.field} className="align-top">
                                  <th className="py-1 pr-2 text-left font-bold">{c.field}</th>
                                  <td className="py-1">
                                    <span className="block bg-sindoor-soft px-1 line-through decoration-sindoor/60">{c.before}</span>
                                    <span className="mt-0.5 block bg-mehendi-soft px-1">{c.after}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
