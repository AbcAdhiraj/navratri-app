import Link from "next/link";
import { Panel, when } from "@/components/admin/ui";
import { getRepo } from "@/lib/data";

export default async function AdminHistory() {
  const decisions = await getRepo().adminListDecisions(200);
  return (
    <div className="grid gap-6">
      <h1 className="t-h1 !text-5xl">Approval history</h1>
      <Panel>
        {decisions.length === 0 ? (
          <p className="text-sm text-ink-soft">No moderation decisions recorded yet.</p>
        ) : (
          <ol className="relative grid gap-5 before:absolute before:bottom-2 before:left-[0.3rem] before:top-2 before:w-[1.5px] before:bg-ink/15">
            {decisions.map((d) => (
              <li key={d.id} className="relative pl-7 text-sm">
                <span className="absolute left-0 top-1.5 size-3 rounded-full border-[1.5px] border-ink bg-haldi" />
                <p>
                  <b className="capitalize">{d.action.replace("_", " ")}</b>
                  {d.note ? ` — ${d.note}` : ""}
                </p>
                <p className="text-xs text-ink-faint">
                  {d.actor} · {when(d.createdAt)}
                  {d.submissionId && (
                    <>
                      {" "}
                      ·{" "}
                      <Link className="underline" href={`/admin/submissions/${d.submissionId}`}>
                        submission
                      </Link>
                    </>
                  )}
                  {d.eventId && (
                    <>
                      {" "}
                      ·{" "}
                      <Link className="underline" href={`/admin/events/${d.eventId}`}>
                        event
                      </Link>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
