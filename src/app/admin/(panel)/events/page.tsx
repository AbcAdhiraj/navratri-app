import Link from "next/link";
import { StatusBadge, when } from "@/components/admin/ui";
import { AREA_META } from "@/lib/constants";
import { getRepo } from "@/lib/data";
import { cx, formatDateRange, priceLabel } from "@/lib/format";
import { EVENT_STATUSES } from "@/lib/types";

export default async function AdminEvents({ searchParams }: PageProps<"/admin/events">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";
  const all = await getRepo().adminListEvents();
  const list = all.filter((e) => (status === "all" || e.status === status) && (!q || `${e.title} ${e.venue.locality} ${e.slug}`.toLowerCase().includes(q)));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-h1 !text-5xl">Events</h1>
        <Link href="/admin/events/new" className="btn btn-red">
          + New event
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...EVENT_STATUSES].map((s) => (
          <Link key={s} href={`/admin/events?status=${s}${q ? `&q=${q}` : ""}`} className="chip capitalize" data-active={status === s}>
            {s} <span className="opacity-60">{s === "all" ? all.length : all.filter((e) => e.status === s).length}</span>
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Search title, locality, slug" className="rounded-full border-[1.5px] border-ink/20 bg-card px-4 py-2 text-sm outline-none focus:border-ink" />
        </form>
      </div>
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-ink/15 bg-card">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b-[1.5px] border-ink/10 text-xs uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Where</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Checks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {list.map((e) => (
              <tr key={e.id} className="hover:bg-paper-2/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/events/${e.id}`} className="font-bold hover:underline">
                    {e.title}
                  </Link>
                  <span className="block text-xs text-ink-faint">/{e.slug}</span>
                </td>
                <td className="px-4 py-3">
                  {e.venue.locality}, {AREA_META[e.venue.area].label}
                </td>
                <td className="px-4 py-3">{formatDateRange(e.occurrences)}</td>
                <td className="px-4 py-3">{priceLabel(e.price)}</td>
                <td className="px-4 py-3 text-xs">
                  {[
                    ["D", e.verification.dateChecked],
                    ["P", e.verification.priceChecked],
                    ["E", e.verification.entryChecked],
                    ["B", !!e.booking?.verified],
                  ].map(([k, ok]) => (
                    <span key={String(k)} className={cx("mr-1 inline-grid size-5 place-items-center rounded font-bold", ok ? "bg-mehendi text-cream" : "bg-paper-3 text-ink-faint")} title={String(k)}>
                      {String(k)}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">{when(e.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-sm text-ink-soft">No events match.</p>}
      </div>
    </div>
  );
}
