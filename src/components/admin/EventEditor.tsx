"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { saveEventAction } from "@/app/admin/actions";
import { findDuplicates } from "@/lib/admin/duplicates";
import { AREA_META, EVENT_TYPE_META, MUSIC_META, NAVRATRI_DAYS, SOURCE_KIND_META, VIBE_META } from "@/lib/constants";
import { cx, slugify } from "@/lib/format";
import {
  AREAS,
  EVENT_STATUSES,
  EVENT_TYPES,
  MUSIC_STYLES,
  SOURCE_KINDS,
  VIBE_TAGS,
  type EventRecord,
  type TriState,
} from "@/lib/types";
import type { Errors } from "@/lib/validate";

const input = "w-full rounded-xl border-[1.5px] border-ink/20 bg-card px-3 py-2 text-sm font-medium outline-none focus:border-ink";
const uid = () => `tmp-${Math.random().toString(36).slice(2, 9)}`;

function Field({ label, children, error, className }: { label: string; children: ReactNode; error?: string; className?: string }) {
  return (
    <label className={cx("grid gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft", className)}>
      {label}
      <span className="normal-case tracking-normal text-ink">{children}</span>
      {error && <span className="normal-case tracking-normal text-sindoor">{error}</span>}
    </label>
  );
}

function Section({ title, children, error }: { title: string; children: ReactNode; error?: string }) {
  return (
    <fieldset className={cx("rounded-2xl border-[1.5px] bg-card p-5", error ? "border-sindoor" : "border-ink/15")}>
      <legend className="px-2 font-display text-lg font-bold">{title}</legend>
      {error && <p className="mb-3 text-sm font-bold text-sindoor">{error}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

function Tri({ label, value, onChange }: { label: string; value: TriState; onChange: (v: TriState) => void }) {
  const v = value === true ? "yes" : value === false ? "no" : "unknown";
  return (
    <Field label={label}>
      <select className={input} value={v} onChange={(e) => onChange(e.target.value === "yes" ? true : e.target.value === "no" ? false : null)}>
        <option value="unknown">Not confirmed</option>
        <option value="yes">Yes (confirmed)</option>
        <option value="no">No (confirmed)</option>
      </select>
    </Field>
  );
}

function Toggles<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void; label: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} type="button" className="chip !py-1.5 !text-xs" aria-pressed={value.includes(o)} onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}>
          {label(o)}
        </button>
      ))}
    </div>
  );
}

export function EventEditor({ initial, all, fromSubmissionId, isNew }: { initial: EventRecord; all: EventRecord[]; fromSubmissionId: string | null; isNew: boolean }) {
  const [ev, setEv] = useState<EventRecord>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const up = (patch: Partial<EventRecord>) => setEv((e) => ({ ...e, ...patch }));

  const dupes = useMemo(
    () =>
      findDuplicates(
        { title: ev.title, area: ev.venue.area, locality: ev.venue.locality, venueName: ev.venue.name, dates: ev.occurrences.map((o) => o.date), excludeId: ev.id },
        all,
      ),
    [ev.title, ev.venue, ev.occurrences, ev.id, all],
  );

  const save = () => {
    const payload: EventRecord = {
      ...ev,
      title: ev.isDemo && !/^DEMO\s*[—–-]/.test(ev.title) ? `DEMO — ${ev.title}` : ev.title,
      booking: ev.booking && ev.booking.url.trim() ? ev.booking : null,
      organizer: ev.organizer && ev.organizer.name.trim() ? ev.organizer : null,
    };
    setMessage(null);
    start(async () => {
      const res = await saveEventAction(JSON.stringify(payload), fromSubmissionId);
      if (res && !res.ok) {
        setErrors(res.errors);
        setMessage(res.message);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-5"
    >
      {message && (
        <p role="alert" className="rounded-2xl border-[1.5px] border-sindoor bg-sindoor-soft px-4 py-3 text-sm font-bold text-sindoor-deep">
          {message}
        </p>
      )}
      {dupes.length > 0 && (
        <div className="rounded-2xl border-[1.5px] border-ink bg-haldi-soft p-4 text-sm">
          <p className="font-bold">Possible duplicates</p>
          <ul className="mt-2 grid gap-1">
            {dupes.map((d) => (
              <li key={d.event.id}>
                <Link href={`/admin/events/${d.event.id}`} className="font-bold underline" target="_blank">
                  {d.event.title}
                </Link>{" "}
                <span className="text-ink-soft">
                  — {Math.round(d.score * 100)} · {d.reasons.join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Basics" error={errors.title || errors.slug}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" error={errors.title}>
            <input className={input} value={ev.title} onChange={(e) => up({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} required />
          </Field>
          <Field label="Slug (stable URL)" error={errors.slug}>
            <input
              className={input}
              value={ev.slug}
              onChange={(e) => {
                setSlugTouched(true);
                up({ slug: e.target.value });
              }}
            />
          </Field>
          <Field label="Tagline">
            <input className={input} value={ev.tagline ?? ""} onChange={(e) => up({ tagline: e.target.value || null })} maxLength={200} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Status">
              <select className={input} value={ev.status} onChange={(e) => up({ status: e.target.value as EventRecord["status"] })}>
                {EVENT_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Scale">
              <select className={input} value={ev.scale ?? ""} onChange={(e) => up({ scale: (e.target.value || null) as EventRecord["scale"] })}>
                <option value="">—</option>
                <option value="intimate">intimate</option>
                <option value="mid">mid</option>
                <option value="large">large</option>
              </select>
            </Field>
            <div className="grid content-end gap-1.5 text-sm font-bold">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={ev.featured} onChange={(e) => up({ featured: e.target.checked })} /> Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={ev.isDemo} onChange={(e) => up({ isDemo: e.target.checked })} /> Demo fixture
              </label>
            </div>
          </div>
        </div>
        <Field label="Description">
          <textarea className={cx(input, "min-h-24")} value={ev.description ?? ""} onChange={(e) => up({ description: e.target.value || null })} />
        </Field>
      </Section>

      <Section title="Venue" error={errors.venueName || errors.locality}>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Venue name" error={errors.venueName} className="md:col-span-2">
            <input className={input} value={ev.venue.name} onChange={(e) => up({ venue: { ...ev.venue, name: e.target.value } })} />
          </Field>
          <Field label="Locality" error={errors.locality}>
            <input className={input} value={ev.venue.locality} onChange={(e) => up({ venue: { ...ev.venue, locality: e.target.value } })} />
          </Field>
          <Field label="City">
            <select className={input} value={ev.venue.area} onChange={(e) => up({ venue: { ...ev.venue, area: e.target.value as EventRecord["venue"]["area"] } })}>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {AREA_META[a].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Address (only if confirmed)">
          <input className={input} value={ev.venue.address ?? ""} onChange={(e) => up({ venue: { ...ev.venue, address: e.target.value || null } })} />
        </Field>
      </Section>

      <Section title="Dates & times" error={errors.occurrences}>
        <div className="flex flex-wrap gap-1.5">
          {NAVRATRI_DAYS.map((d) => {
            const on = ev.occurrences.some((o) => o.date === d.date);
            return (
              <button
                key={d.date}
                type="button"
                className="chip !py-1.5 !text-xs"
                aria-pressed={on}
                onClick={() =>
                  up({
                    occurrences: on
                      ? ev.occurrences.filter((o) => o.date !== d.date)
                      : [...ev.occurrences, { date: d.date, startTime: ev.occurrences[0]?.startTime ?? null, endTime: ev.occurrences[0]?.endTime ?? null, note: null }].sort((a, b) => a.date.localeCompare(b.date)),
                  })
                }
              >
                {d.date.slice(8)} Oct · N{d.night}
              </button>
            );
          })}
        </div>
        {ev.occurrences.map((o, i) => (
          <div key={o.date + i} className="grid grid-cols-[8rem_1fr_1fr_2fr_auto] items-end gap-2">
            <Field label="Date">
              <input className={input} value={o.date} onChange={(e) => up({ occurrences: ev.occurrences.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} />
            </Field>
            <Field label="Start">
              <input type="time" className={input} value={o.startTime ?? ""} onChange={(e) => up({ occurrences: ev.occurrences.map((x, j) => (j === i ? { ...x, startTime: e.target.value || null } : x)) })} />
            </Field>
            <Field label="End">
              <input type="time" className={input} value={o.endTime ?? ""} onChange={(e) => up({ occurrences: ev.occurrences.map((x, j) => (j === i ? { ...x, endTime: e.target.value || null } : x)) })} />
            </Field>
            <Field label="Note">
              <input className={input} value={o.note ?? ""} onChange={(e) => up({ occurrences: ev.occurrences.map((x, j) => (j === i ? { ...x, note: e.target.value || null } : x)) })} />
            </Field>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ occurrences: ev.occurrences.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
      </Section>

      <Section title="Price" error={errors.price}>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Status">
            <select
              className={input}
              value={ev.price.status}
              onChange={(e) => {
                const status = e.target.value as EventRecord["price"]["status"];
                up({ price: { ...ev.price, status, ...(status !== "paid" ? { minInr: null, maxInr: null } : {}) } });
              }}
            >
              <option value="unknown">Unknown (never shown as ₹0)</option>
              <option value="free">Free (verified)</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
          <Field label="Min ₹">
            <input type="number" min={1} className={input} disabled={ev.price.status !== "paid"} value={ev.price.minInr ?? ""} onChange={(e) => up({ price: { ...ev.price, minInr: e.target.value ? Number(e.target.value) : null } })} />
          </Field>
          <Field label="Max ₹">
            <input type="number" min={1} className={input} disabled={ev.price.status !== "paid"} value={ev.price.maxInr ?? ""} onChange={(e) => up({ price: { ...ev.price, maxInr: e.target.value ? Number(e.target.value) : null } })} />
          </Field>
          <Field label="Note">
            <input className={input} value={ev.price.note ?? ""} onChange={(e) => up({ price: { ...ev.price, note: e.target.value || null } })} />
          </Field>
        </div>
      </Section>

      <Section title="Entry & food">
        <div className="grid gap-4 md:grid-cols-4">
          <Tri label="Groups allowed" value={ev.entry.groupsAllowed} onChange={(v) => up({ entry: { ...ev.entry, groupsAllowed: v } })} />
          <Tri label="Stags allowed" value={ev.entry.stagsAllowed} onChange={(v) => up({ entry: { ...ev.entry, stagsAllowed: v } })} />
          <Tri label="Couples only" value={ev.entry.couplesOnly} onChange={(v) => up({ entry: { ...ev.entry, couplesOnly: v } })} />
          <Tri label="Families welcome" value={ev.entry.familiesWelcome} onChange={(v) => up({ entry: { ...ev.entry, familiesWelcome: v } })} />
          <Field label="Min age">
            <input type="number" min={0} max={99} className={input} value={ev.entry.minAge ?? ""} onChange={(e) => up({ entry: { ...ev.entry, minAge: e.target.value ? Number(e.target.value) : null } })} />
          </Field>
          <Field label="Dress code">
            <input className={input} value={ev.entry.dressCode ?? ""} onChange={(e) => up({ entry: { ...ev.entry, dressCode: e.target.value || null } })} />
          </Field>
          <Tri label="Food available" value={ev.food.available} onChange={(v) => up({ food: { ...ev.food, available: v } })} />
          <Tri label="Vegetarian only" value={ev.food.vegetarianOnly} onChange={(v) => up({ food: { ...ev.food, vegetarianOnly: v } })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Entry note">
            <input className={input} value={ev.entry.note ?? ""} onChange={(e) => up({ entry: { ...ev.entry, note: e.target.value || null } })} />
          </Field>
          <Field label="Food note">
            <input className={input} value={ev.food.note ?? ""} onChange={(e) => up({ food: { ...ev.food, note: e.target.value || null } })} />
          </Field>
        </div>
      </Section>

      <Section title="Type, music & vibes" error={errors.vibes}>
        <Toggles options={EVENT_TYPES} value={ev.types} onChange={(types) => up({ types })} label={(t) => EVENT_TYPE_META[t].label} />
        <Toggles options={MUSIC_STYLES} value={ev.music} onChange={(music) => up({ music })} label={(m) => MUSIC_META[m]} />
        <p className="text-xs text-ink-soft">Each vibe needs factual evidence and ideally a source.</p>
        {ev.vibes.map((v, i) => (
          <div key={i} className="grid grid-cols-[12rem_1fr_12rem_auto] items-end gap-2">
            <Field label="Vibe">
              <select className={input} value={v.tag} onChange={(e) => up({ vibes: ev.vibes.map((x, j) => (j === i ? { ...x, tag: e.target.value as typeof v.tag } : x)) })}>
                {VIBE_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {VIBE_META[t].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Evidence">
              <input className={input} value={v.evidence} onChange={(e) => up({ vibes: ev.vibes.map((x, j) => (j === i ? { ...x, evidence: e.target.value } : x)) })} />
            </Field>
            <Field label="Source">
              <select className={input} value={v.sourceId ?? ""} onChange={(e) => up({ vibes: ev.vibes.map((x, j) => (j === i ? { ...x, sourceId: e.target.value || null } : x)) })}>
                <option value="">—</option>
                {ev.sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ vibes: ev.vibes.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-sm font-bold underline" onClick={() => up({ vibes: [...ev.vibes, { tag: VIBE_TAGS.find((t) => !ev.vibes.some((v) => v.tag === t)) ?? "traditional_garba", evidence: "", sourceId: null }] })}>
          + Add vibe
        </button>
      </Section>

      <Section title="Organizer & booking" error={errors.booking}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Organizer name">
            <input className={input} value={ev.organizer?.name ?? ""} onChange={(e) => up({ organizer: { name: e.target.value, url: ev.organizer?.url ?? null } })} />
          </Field>
          <Field label="Organizer URL">
            <input className={input} value={ev.organizer?.url ?? ""} onChange={(e) => up({ organizer: { name: ev.organizer?.name ?? "", url: e.target.value || null } })} />
          </Field>
          <Field label="Booking URL (https)" error={errors.booking}>
            <input className={input} value={ev.booking?.url ?? ""} onChange={(e) => up({ booking: { url: e.target.value, platform: ev.booking?.platform ?? "", verified: ev.booking?.verified ?? false } })} />
          </Field>
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <Field label="Platform">
              <input className={input} value={ev.booking?.platform ?? ""} onChange={(e) => up({ booking: { url: ev.booking?.url ?? "", platform: e.target.value, verified: ev.booking?.verified ?? false } })} />
            </Field>
            <label className="flex items-center gap-2 pb-2 text-sm font-bold">
              <input type="checkbox" checked={!!ev.booking?.verified} onChange={(e) => up({ booking: { url: ev.booking?.url ?? "", platform: ev.booking?.platform ?? "", verified: e.target.checked } })} /> Verified
            </label>
          </div>
        </div>
      </Section>

      <Section title="Sources & verification" error={errors.sources || errors.verification}>
        {ev.sources.map((s, i) => (
          <div key={s.id} className="grid grid-cols-[10rem_1fr_2fr_10rem_auto] items-end gap-2">
            <Field label="Kind">
              <select className={input} value={s.kind} onChange={(e) => up({ sources: ev.sources.map((x, j) => (j === i ? { ...x, kind: e.target.value as typeof s.kind } : x)) })}>
                {SOURCE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {SOURCE_KIND_META[k]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Label">
              <input className={input} value={s.label} onChange={(e) => up({ sources: ev.sources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
            </Field>
            <Field label="URL">
              <input className={input} value={s.url} onChange={(e) => up({ sources: ev.sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
            </Field>
            <Field label="Checked on">
              <input type="date" className={input} value={s.checkedAt?.slice(0, 10) ?? ""} onChange={(e) => up({ sources: ev.sources.map((x, j) => (j === i ? { ...x, checkedAt: e.target.value ? `${e.target.value}T12:00:00Z` : null } : x)) })} />
            </Field>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ sources: ev.sources.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-sm font-bold underline" onClick={() => up({ sources: [...ev.sources, { id: uid(), kind: "organizer", label: "", url: "https://", checkedAt: new Date().toISOString() }] })}>
          + Add source
        </button>
        <div className="flex flex-wrap items-end gap-5 border-t-[1.5px] border-dashed border-ink/15 pt-4 text-sm font-bold">
          {(
            [
              ["dateChecked", "Date checked"],
              ["priceChecked", "Price checked"],
              ["entryChecked", "Entry checked"],
            ] as const
          ).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={ev.verification[k]} onChange={(e) => up({ verification: { ...ev.verification, [k]: e.target.checked } })} /> {l}
            </label>
          ))}
          <Field label="Last checked" error={errors.verification}>
            <input type="date" className={input} value={ev.verification.lastCheckedAt?.slice(0, 10) ?? ""} onChange={(e) => up({ verification: { ...ev.verification, lastCheckedAt: e.target.value ? `${e.target.value}T12:00:00Z` : null } })} />
          </Field>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ verification: { ...ev.verification, lastCheckedAt: new Date().toISOString() } })}>
            Checked today
          </button>
        </div>
      </Section>

      <Section title="Media (authorised only)">
        {ev.media.map((m, i) => (
          <div key={m.id} className="grid grid-cols-[2fr_2fr_1fr_6rem_auto] items-end gap-2">
            <Field label="Image URL">
              <input className={input} value={m.url} onChange={(e) => up({ media: ev.media.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
            </Field>
            <Field label="Alt text">
              <input className={input} value={m.alt} onChange={(e) => up({ media: ev.media.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)) })} />
            </Field>
            <Field label="Credit">
              <input className={input} value={m.credit ?? ""} onChange={(e) => up({ media: ev.media.map((x, j) => (j === i ? { ...x, credit: e.target.value || null } : x)) })} />
            </Field>
            <Field label="Year">
              <input type="number" className={input} value={m.year ?? ""} onChange={(e) => up({ media: ev.media.map((x, j) => (j === i ? { ...x, year: e.target.value ? Number(e.target.value) : null } : x)) })} />
            </Field>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ media: ev.media.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-sm font-bold underline" onClick={() => up({ media: [...ev.media, { id: uid(), url: "", alt: "", credit: null, year: null, width: null, height: null }] })}>
          + Add image (permission confirmed)
        </button>
      </Section>

      <Section title="Crowd impression (from ≥ 3 attendee reports)" error={errors.crowd}>
        {ev.crowd ? (
          <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-5">
            <Field label="Edition">
              <input className={input} value={ev.crowd.editionLabel} onChange={(e) => up({ crowd: { ...ev.crowd!, editionLabel: e.target.value } })} />
            </Field>
            <Field label="Women % low">
              <input type="number" className={input} value={ev.crowd.womenPctLow} onChange={(e) => up({ crowd: { ...ev.crowd!, womenPctLow: Number(e.target.value) } })} />
            </Field>
            <Field label="Women % high">
              <input type="number" className={input} value={ev.crowd.womenPctHigh} onChange={(e) => up({ crowd: { ...ev.crowd!, womenPctHigh: Number(e.target.value) } })} />
            </Field>
            <Field label="Reports">
              <input type="number" className={input} value={ev.crowd.reportCount} onChange={(e) => up({ crowd: { ...ev.crowd!, reportCount: Number(e.target.value) } })} />
            </Field>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => up({ crowd: null })}>
              Remove
            </button>
          </div>
        ) : (
          <button type="button" className="justify-self-start text-sm font-bold underline" onClick={() => up({ crowd: { editionLabel: "2025 edition", womenPctLow: 40, womenPctHigh: 50, reportCount: 3 } })}>
            + Add crowd impression
          </button>
        )}
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t-[1.5px] border-ink bg-card/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border-[1.5px]">
        <span className="text-xs text-ink-soft">
          {fromSubmissionId ? "Saving will also approve the linked submission." : "Every save records a revision."}
          {ev.status === "published" ? " · Will be publicly visible." : ""}
        </span>
        <button type="submit" className="btn btn-red" disabled={pending}>
          {pending ? "Saving…" : fromSubmissionId ? "Save & approve submission" : isNew ? "Create event" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
