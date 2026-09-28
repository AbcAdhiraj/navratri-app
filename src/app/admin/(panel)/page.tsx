import Link from "next/link";
import { Panel, Stat, StatusBadge, when } from "@/components/admin/ui";
import { staleEvents } from "@/lib/admin/freshness";
import { getRepo } from "@/lib/data";

export default async function AdminDashboard() {
  const repo = getRepo();
  const [events, subs, decisions] = await Promise.all([repo.adminListEvents(), repo.adminListSubmissions(), repo.adminListDecisions(12)]);
  const pending = subs.filter((s) => s.status === "pending");
  const stale = staleEvents(events);
  const unverifiedBooking = events.filter((e) => e.status === "published" && e.booking && !e.booking.verified);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Moderation</p>
          <h1 className="t-h1 mt-3 !text-5xl">Today’s queue</h1>
        </div>
        <Link href="/admin/events/new" className="btn btn-red">
          + New event
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Pending submissions" value={pending.length} tone={pending.length ? "haldi" : "paper"} />
        <Stat label="Published events" value={events.filter((e) => e.status === "published").length} />
        <Stat label="Drafts" value={events.filter((e) => e.status === "draft").length} />
        <Stat label="Need re-check (7d+)" value={stale.length} tone={stale.length ? "sindoor" : "paper"} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Pending submissions" action={<Link href="/admin/submissions" className="text-sm font-bold underline">All</Link>}>
          {pending.length === 0 ? (
            <p className="text-sm text-ink-soft">Queue is clear. 🎉</p>
          ) : (
            <ul className="divide-y-[1.5px] divide-dashed divide-ink/10">
              {pending.slice(0, 8).map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/submissions/${s.id}`} className="flex items-center justify-between gap-3 py-3 hover:underline">
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{s.kind === "correction" ? `Correction · ${s.eventSlug ?? "?"}` : s.payload.title ?? "Untitled suggestion"}</span>
                      <span className="t-meta text-ink-soft">
                        {s.kind === "correction" ? (s.payload.fields ?? []).join(", ") : [s.payload.locality, s.payload.area].filter(Boolean).join(", ")} · {when(s.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent decisions" action={<Link href="/admin/history" className="text-sm font-bold underline">History</Link>}>
          {decisions.length === 0 ? (
            <p className="text-sm text-ink-soft">No decisions yet.</p>
          ) : (
            <ul className="grid gap-3 text-sm">
              {decisions.map((d) => (
                <li key={d.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sindoor" />
                  <span>
                    <b className="capitalize">{d.action.replace("_", " ")}</b> {d.note ? `— ${d.note}` : ""}
                    <span className="block text-xs text-ink-faint">
                      {d.actor} · {when(d.createdAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      {(stale.length > 0 || unverifiedBooking.length > 0) && (
        <Panel title="Needs attention">
          <ul className="grid gap-2 text-sm">
            {stale.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/events/${e.id}`} className="font-bold underline">
                  {e.title}
                </Link>{" "}
                — last checked {e.verification.lastCheckedAt ? when(e.verification.lastCheckedAt) : "never"}
              </li>
            ))}
            {unverifiedBooking.map((e) => (
              <li key={`b-${e.id}`}>
                <Link href={`/admin/events/${e.id}`} className="font-bold underline">
                  {e.title}
                </Link>{" "}
                — booking link not verified (hidden from the public page)
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
