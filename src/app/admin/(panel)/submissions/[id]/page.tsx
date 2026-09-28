import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, StatusBadge, when } from "@/components/admin/ui";
import { flatten } from "@/lib/admin/diff";
import { findDuplicates } from "@/lib/admin/duplicates";
import { AREA_META, EVENT_TYPE_META, MUSIC_META } from "@/lib/constants";
import { getRepo } from "@/lib/data";
import { decideAction } from "../../../actions";

const FIELD_MAP: Record<string, string[]> = {
  "Date or time": ["Dates"],
  Price: ["Price"],
  "Venue or location": ["Venue"],
  "Entry rules": ["Entry"],
  "Booking link": ["Booking"],
  "Music or vibe": ["Music", "Vibes"],
  "Event cancelled": ["Status"],
  "Something else": ["Title", "Tagline"],
};

export default async function SubmissionDetail({ params, searchParams }: PageProps<"/admin/submissions/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const repo = getRepo();
  const sub = await repo.adminGetSubmission(id);
  if (!sub) notFound();
  const [all, decisions] = await Promise.all([repo.adminListEvents(), repo.adminListDecisions(200)]);
  const target = sub.eventId ? all.find((e) => e.id === sub.eventId) : null;
  const p = sub.payload;
  const dupes = sub.kind === "new_event" ? findDuplicates({ title: p.title, area: p.area, locality: p.locality, venueName: p.venueName, dates: p.dates }, all) : [];
  const files = await Promise.all(sub.evidenceFiles.map(async (path) => ({ path, url: await repo.adminEvidenceUrl(path) })));
  const flat = target ? flatten(target) : {};
  const history = decisions.filter((d) => d.submissionId === sub.id);

  const rows: [string, string][] =
    sub.kind === "new_event"
      ? [
          ["Title", p.title ?? "—"],
          ["Where", [p.venueName, p.locality, p.area ? AREA_META[p.area as keyof typeof AREA_META]?.label : ""].filter(Boolean).join(", ") || "—"],
          ["Nights", (p.dates ?? []).join(", ") || "—"],
          ["Time", p.startTime ? `${p.startTime}–${p.endTime ?? "?"}` : "—"],
          ["Entry", p.priceStatus === "paid" ? `Paid${p.priceMin ? ` from ₹${p.priceMin}` : ""}` : (p.priceStatus ?? "—")],
          ["Types", (p.types ?? []).map((t) => EVENT_TYPE_META[t].label).join(", ") || "—"],
          ["Music", (p.music ?? []).map((m) => MUSIC_META[m]).join(", ") || "—"],
          ["Organizer", p.organizerName ?? "—"],
          ["Booking link", p.bookingUrl ?? "—"],
        ]
      : [
          ["Listing", target?.title ?? sub.eventSlug ?? "—"],
          ["Fields", (p.fields ?? []).join(", ")],
          ["Correct info", p.details ?? "—"],
        ];

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/submissions" className="text-sm font-bold underline">
          ← Submissions
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="t-h1 !text-4xl">{sub.kind === "correction" ? "Correction" : "New event suggestion"}</h1>
          <StatusBadge status={sub.status} />
        </div>
        <p className="t-meta mt-1 text-ink-soft">
          Received {when(sub.createdAt)} · ref {sub.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
      {sp.decided && <p className="rounded-2xl border-[1.5px] border-ink bg-mehendi-soft px-4 py-3 text-sm font-bold">Decision recorded.</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-5">
          <Panel title="Submitted details">
            <dl className="grid gap-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-3">
                  <dt className="font-bold text-ink-soft">{k}</dt>
                  <dd className="whitespace-pre-wrap break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {sub.kind === "correction" && target && (
            <Panel title="Current listing (flagged fields)" action={<Link href={`/events/${target.slug}`} target="_blank" className="text-sm font-bold underline">Public page ↗</Link>}>
              <table className="w-full text-sm">
                <tbody>
                  {(p.fields ?? []).flatMap((f) => FIELD_MAP[f] ?? []).map((k) => (
                    <tr key={k} className="align-top">
                      <th className="w-32 py-1.5 pr-3 text-left font-bold text-ink-soft">{k}</th>
                      <td className="py-1.5">{flat[k] ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          <Panel title="Evidence">
            <ul className="grid gap-2 text-sm">
              {sub.evidenceUrls.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer nofollow" className="font-bold break-all underline">
                    {u}
                  </a>
                </li>
              ))}
              {files.map((f) => (
                <li key={f.path}>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                      📎 {f.path.split("/").pop()}
                    </a>
                  ) : (
                    <span className="text-ink-soft">📎 {f.path}</span>
                  )}
                </li>
              ))}
              {sub.evidenceUrls.length + files.length === 0 && <li className="text-ink-soft">No evidence attached.</li>}
            </ul>
          </Panel>

          {sub.kind === "new_event" && (
            <Panel title={`Possible duplicates (${dupes.length})`}>
              {dupes.length === 0 ? (
                <p className="text-sm text-ink-soft">No likely duplicates found.</p>
              ) : (
                <ul className="grid gap-2 text-sm">
                  {dupes.map((d) => (
                    <li key={d.event.id} className="flex items-start justify-between gap-3 rounded-xl bg-paper-2 px-3 py-2">
                      <span>
                        <Link href={`/admin/events/${d.event.id}`} className="font-bold underline">
                          {d.event.title}
                        </Link>
                        <span className="block text-xs text-ink-soft">{d.reasons.join(" · ")}</span>
                      </span>
                      <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-cream">{Math.round(d.score * 100)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>

        <aside className="grid content-start gap-5">
          <Panel title="Decide">
            {sub.status !== "pending" ? (
              <p className="text-sm">
                Already <b>{sub.status}</b>.
              </p>
            ) : (
              <div className="grid gap-5">
                <Link href={sub.kind === "new_event" ? `/admin/events/new?from=${sub.id}` : `/admin/events/${sub.eventId}?from=${sub.id}`} className="btn btn-red w-full">
                  {sub.kind === "new_event" ? "Create event from this" : "Apply correction"}
                </Link>
                <form action={decideAction} className="grid gap-2 border-t-[1.5px] border-dashed border-ink/15 pt-4">
                  <input type="hidden" name="submissionId" value={sub.id} />
                  <input type="hidden" name="action" value="reject" />
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft" htmlFor="reject-note">
                    Reject with note
                  </label>
                  <textarea id="reject-note" name="note" className="min-h-20 rounded-xl border-[1.5px] border-ink/20 bg-card p-3 text-sm outline-none focus:border-ink" placeholder="e.g. Couldn’t verify with the organizer" />
                  <button className="btn btn-outline btn-sm">Reject</button>
                </form>
                <form action={decideAction} className="grid gap-2 border-t-[1.5px] border-dashed border-ink/15 pt-4">
                  <input type="hidden" name="submissionId" value={sub.id} />
                  <input type="hidden" name="action" value="mark_duplicate" />
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft" htmlFor="dupe-of">
                    Mark as duplicate of
                  </label>
                  <select id="dupe-of" name="duplicateOf" className="rounded-xl border-[1.5px] border-ink/20 bg-card p-2.5 text-sm" defaultValue={dupes[0]?.event.slug ?? ""}>
                    <option value="">— choose —</option>
                    {(dupes.length ? dupes.map((d) => d.event) : all).map((e) => (
                      <option key={e.id} value={e.slug}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-outline btn-sm">Mark duplicate</button>
                </form>
              </div>
            )}
          </Panel>
          <Panel title="Submitter">
            <p className="text-sm">{sub.contactEmail ?? "No email given"}</p>
            {sub.submitterNote && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">“{sub.submitterNote}”</p>}
          </Panel>
          {history.length > 0 && (
            <Panel title="Decision history">
              <ul className="grid gap-2 text-sm">
                {history.map((d) => (
                  <li key={d.id}>
                    <b className="capitalize">{d.action.replace("_", " ")}</b> — {d.note ?? "no note"}
                    <span className="block text-xs text-ink-faint">
                      {d.actor} · {when(d.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
