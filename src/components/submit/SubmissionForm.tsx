"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type DragEvent } from "react";
import { submitToModeration } from "@/app/(site)/submit/actions";
import { AREA_META, EVENT_TYPE_META, MUSIC_META, NAVRATRI_DAYS } from "@/lib/constants";
import { cx, formatDay, parseDay } from "@/lib/format";
import { AREAS, EVENT_TYPES, MUSIC_STYLES, type Area, type EventType, type MusicStyle, type PriceStatus } from "@/lib/types";
import { ACCEPTED_TYPES, CORRECTION_FIELDS, MAX_FILES, MAX_TOTAL_BYTES, validateSubmission, type Errors, type SubmissionInput } from "@/lib/validate";
import { Rangoli } from "../art/Rangoli";
import { Icon, type IconName } from "../ui/Icon";
import { ChipGroup, FieldError, TextArea, TextField } from "./fields";

export interface PickableEvent {
  slug: string;
  title: string;
  isDemo: boolean;
  locality: string;
  area: Area;
  firstDate: string | null;
}

type Kind = "new_event" | "correction";
type StepId = "kind" | "basics" | "when" | "details" | "event" | "issue" | "evidence" | "review";

const STEPS: Record<Kind, { id: StepId; label: string }[]> = {
  new_event: [
    { id: "kind", label: "Start" },
    { id: "basics", label: "Basics" },
    { id: "when", label: "When" },
    { id: "details", label: "Details" },
    { id: "evidence", label: "Evidence" },
    { id: "review", label: "Review" },
  ],
  correction: [
    { id: "kind", label: "Start" },
    { id: "event", label: "Listing" },
    { id: "issue", label: "What’s wrong" },
    { id: "evidence", label: "Evidence" },
    { id: "review", label: "Review" },
  ],
};

/** Which validation keys belong to which step. */
const STEP_KEYS: Record<StepId, string[]> = {
  kind: ["kind"],
  basics: ["title", "area", "locality"],
  when: ["dates"],
  details: ["priceStatus", "priceMin", "bookingUrl", "types", "music"],
  event: ["event"],
  issue: ["fields", "details"],
  evidence: ["links", "evidence", "files", "email", "note"],
  review: ["confirm"],
};

interface State {
  kind: Kind | null;
  title: string;
  area: Area | "";
  locality: string;
  venueName: string;
  dates: string[];
  startTime: string;
  endTime: string;
  priceStatus: PriceStatus | "";
  priceMin: string;
  types: EventType[];
  music: MusicStyle[];
  organizerName: string;
  bookingUrl: string;
  eventSlug: string | null;
  fields: string[];
  details: string;
  links: string[];
  email: string;
  note: string;
  confirm: boolean;
}

const initial = (kind: Kind | null, eventSlug: string | null): State => ({
  kind,
  title: "",
  area: "",
  locality: "",
  venueName: "",
  dates: [],
  startTime: "",
  endTime: "",
  priceStatus: "",
  priceMin: "",
  types: [],
  music: [],
  organizerName: "",
  bookingUrl: "",
  eventSlug,
  fields: [],
  details: "",
  links: ["", ""],
  email: "",
  note: "",
  confirm: false,
});

function toInput(s: State): SubmissionInput {
  return {
    kind: s.kind ?? "new_event",
    eventSlug: s.kind === "correction" ? s.eventSlug : null,
    payload:
      s.kind === "correction"
        ? { fields: s.fields, details: s.details.trim() }
        : {
            title: s.title.trim(),
            area: s.area,
            locality: s.locality.trim(),
            venueName: s.venueName.trim() || undefined,
            dates: [...s.dates].sort(),
            startTime: s.startTime || undefined,
            endTime: s.endTime || undefined,
            priceStatus: s.priceStatus || undefined,
            priceMin: s.priceStatus === "paid" && s.priceMin ? Number(s.priceMin) : null,
            types: s.types,
            music: s.music,
            organizerName: s.organizerName.trim() || undefined,
            bookingUrl: s.bookingUrl.trim() || undefined,
          },
    links: s.links,
    email: s.email.trim(),
    note: s.note.trim(),
  };
}

const bytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function SubmissionForm({ events, initialKind, initialEventSlug }: { events: PickableEvent[]; initialKind: Kind | null; initialEventSlug: string | null }) {
  const [s, setS] = useState<State>(() => initial(initialKind, initialEventSlug));
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(initialKind ? 1 : 0);
  const [errors, setErrors] = useState<Errors>({});
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [dir, setDir] = useState<1 | -1>(1);
  const heading = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const steps = STEPS[s.kind ?? "new_event"];
  const current = steps[Math.min(step, steps.length - 1)];
  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    setErrors((e) => {
      if (!e[k as string]) return e;
      const next = { ...e };
      delete next[k as string];
      return next;
    });
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Bring the top of the form (stepper included) back into view, then move focus to the step heading.
    const top = card.current?.getBoundingClientRect().top ?? 0;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 64;
    if (top < navH || top > window.innerHeight * 0.6) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: window.scrollY + top - navH - 16, behavior: reduce ? "auto" : "smooth" });
    }
    heading.current?.focus({ preventScroll: true });
  }, [step, done]);

  const validateStep = (id: StepId): Errors => {
    if (id === "kind") return s.kind ? {} : { kind: "Choose one to continue." };
    if (id === "review") return s.confirm ? {} : { confirm: "Please confirm before sending." };
    const all = validateSubmission(toInput(s), files.map((f) => ({ size: f.size, type: f.type })));
    return Object.fromEntries(Object.entries(all).filter(([k]) => STEP_KEYS[id].includes(k)));
  };

  const next = () => {
    const e = validateStep(current.id);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true'], [data-error-anchor]")?.focus());
      return;
    }
    setDir(1);
    setStep((x) => Math.min(x + 1, steps.length - 1));
  };
  const back = () => {
    setErrors({});
    setDir(-1);
    setStep((x) => Math.max(0, x - 1));
  };
  const goTo = (id: StepId) => {
    const i = steps.findIndex((x) => x.id === id);
    if (i >= 0) {
      setDir(-1);
      setStep(i);
    }
  };

  const submit = () => {
    const e = validateStep("review");
    const all = { ...validateSubmission(toInput(s), files.map((f) => ({ size: f.size, type: f.type }))), ...e };
    setErrors(all);
    if (Object.keys(all).length) {
      const bad = steps.find((st) => STEP_KEYS[st.id].some((k) => all[k]));
      if (bad && bad.id !== "review") goTo(bad.id);
      return;
    }
    const fd = new FormData();
    fd.set("data", JSON.stringify(toInput(s)));
    fd.set("website", honeypot.current?.value ?? "");
    files.forEach((f) => fd.append("files", f));
    setServerMsg(null);
    start(async () => {
      const res = await submitToModeration(fd);
      if (res.ok) setDone(res.id);
      else {
        setServerMsg(res.message);
        if (res.errors) {
          setErrors(res.errors);
          const bad = steps.find((st) => STEP_KEYS[st.id].some((k) => res.errors![k]));
          if (bad) goTo(bad.id);
        }
      }
    });
  };

  if (done)
    return (
      <div ref={card}>
        <Success
          id={done}
          kind={s.kind ?? "new_event"}
          headingRef={heading}
          onAgain={() => {
            setS(initial(null, null));
            setFiles([]);
            setStep(0);
            setDone(null);
          }}
        />
      </div>
    );

  const progress = step / (steps.length - 1);

  return (
    <div ref={card} className="overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card shadow-[var(--shadow-print-lg)]">
      {/* Stepper */}
      <div className="border-b-[1.5px] border-dashed border-ink/20 px-5 pb-5 pt-6 md:px-8">
        <ol className="flex items-center justify-between gap-1" aria-label="Progress">
          {steps.map((st, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={st.id} className="flex flex-1 flex-col items-center gap-2 text-center" aria-current={state === "current" ? "step" : undefined}>
                <span
                  className={cx(
                    "grid size-8 place-items-center rounded-full border-[1.5px] text-xs font-extrabold transition-all duration-500",
                    state === "done" && "border-ink bg-mehendi text-cream",
                    state === "current" && "scale-110 border-ink bg-haldi text-ink shadow-[var(--shadow-print-sm)]",
                    state === "todo" && "border-ink/20 text-ink-faint",
                  )}
                >
                  {state === "done" ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cx("hidden text-[0.68rem] font-bold uppercase tracking-wider sm:block", state === "todo" ? "text-ink-faint" : "text-ink")}>{st.label}</span>
                <span className="sr-only">{state === "done" ? "(completed)" : state === "current" ? "(current step)" : ""}</span>
              </li>
            );
          })}
        </ol>
        <div className="relative mt-4 h-1.5 rounded-full bg-ink/10" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 rounded-full bg-sindoor transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${progress * 100}%` }} />
          <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-[1.5px] border-ink bg-haldi transition-[left] duration-700 ease-[var(--ease-out-expo)]" style={{ left: `${progress * 100}%` }} />
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (current.id === "review") submit();
          else next();
        }}
      >
        {/* honeypot */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label>
            Website <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div key={`${s.kind}-${current.id}`} className="px-5 py-8 md:px-8 md:py-10" style={{ animation: `${dir === 1 ? "rise" : "fade"} .5s var(--ease-out-expo) both` }}>
          {current.id === "kind" && (
            <Step title="What would you like to share?" lead="Both go to a moderator first — nothing is published automatically." headingRef={heading}>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Submission type">
                {(
                  [
                    { k: "new_event", icon: "plus", title: "Suggest an event", body: "A garba, dandiya or Navratri night we haven’t listed yet." },
                    { k: "correction", icon: "edit", title: "Correct a listing", body: "Wrong date, price, venue or entry rule on an existing event." },
                  ] as { k: Kind; icon: IconName; title: string; body: string }[]
                ).map((o) => {
                  const on = s.kind === o.k;
                  return (
                    <button
                      key={o.k}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        set("kind", o.k);
                        setErrors({});
                      }}
                      className={cx(
                        "group flex flex-col items-start gap-4 rounded-[var(--radius-card)] border-[1.5px] p-5 text-left transition-all duration-300",
                        on ? "border-ink bg-haldi shadow-[var(--shadow-print)]" : "border-ink/20 hover:border-ink",
                      )}
                    >
                      <span className={cx("grid size-11 place-items-center rounded-full border-[1.5px] border-ink", on ? "bg-ink text-haldi" : "bg-paper-2")}>
                        <Icon name={o.icon} size={19} />
                      </span>
                      <span>
                        <span className="block font-display text-xl font-bold">{o.title}</span>
                        <span className="mt-1 block text-sm text-ink-soft">{o.body}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError id="kind-error" error={errors.kind} />
            </Step>
          )}

          {current.id === "basics" && (
            <Step title="The basics" lead="Name it the way the organizer does, so we can match it to their listing." headingRef={heading}>
              <TextField id="title" label="Event name" placeholder="e.g. Dwarka Dandiya Utsav" value={s.title} onChange={(e) => set("title", e.target.value)} error={errors.title} maxLength={120} autoComplete="off" />
              <ChipGroup id="area" legend="City" options={AREAS.map((a) => ({ value: a, label: AREA_META[a].label }))} value={s.area ? [s.area] : []} onChange={(v) => set("area", (v[0] as Area) ?? "")} error={errors.area} />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField id="locality" label="Locality / sector" placeholder="e.g. Sector 10" value={s.locality} onChange={(e) => set("locality", e.target.value)} error={errors.locality} maxLength={80} />
                <TextField id="venue" label="Venue" optional placeholder="e.g. Central Park lawn" value={s.venueName} onChange={(e) => set("venueName", e.target.value)} maxLength={120} />
              </div>
            </Step>
          )}

          {current.id === "when" && (
            <Step title="Which nights?" lead="Pick every night it runs. Times help, but only if you’re sure." headingRef={heading}>
              <fieldset aria-describedby={errors.dates ? "dates-error" : undefined}>
                <legend className="mb-3 text-sm font-bold">Nights</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9" data-error-anchor={errors.dates ? true : undefined} tabIndex={errors.dates ? -1 : undefined}>
                  {NAVRATRI_DAYS.map((d) => {
                    const p = parseDay(d.date);
                    const on = s.dates.includes(d.date);
                    return (
                      <button
                        key={d.date}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("dates", on ? s.dates.filter((x) => x !== d.date) : [...s.dates, d.date])}
                        className={cx(
                          "flex flex-col items-center rounded-2xl border-[1.5px] py-2.5 transition-all",
                          on ? "border-ink bg-haldi shadow-[var(--shadow-print-sm)]" : "border-ink/15 hover:border-ink",
                        )}
                      >
                        <span className="t-label text-[0.58rem] text-ink-soft">{p.weekday}</span>
                        <span className="font-display text-xl font-bold tabular">{p.d}</span>
                        <span className="text-[0.58rem] font-bold uppercase text-ink-faint">Night {d.night}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-3 text-xs font-bold">
                  <button type="button" className="underline underline-offset-4" onClick={() => set("dates", NAVRATRI_DAYS.map((d) => d.date))}>
                    All nine nights
                  </button>
                  {s.dates.length > 0 && (
                    <button type="button" className="text-ink-soft underline underline-offset-4" onClick={() => set("dates", [])}>
                      Clear
                    </button>
                  )}
                </div>
                <FieldError id="dates-error" error={errors.dates} />
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField id="start" type="time" label="Starts" optional value={s.startTime} onChange={(e) => set("startTime", e.target.value)} />
                <TextField id="end" type="time" label="Ends" optional value={s.endTime} onChange={(e) => set("endTime", e.target.value)} hint="Past midnight is fine." />
              </div>
            </Step>
          )}

          {current.id === "details" && (
            <Step title="Entry & music" lead="Leave anything you’re unsure about blank — “not sure” beats a guess." headingRef={heading}>
              <ChipGroup
                id="priceStatus"
                legend="Entry"
                options={[
                  { value: "free", label: "Free entry" },
                  { value: "paid", label: "Paid / ticketed" },
                  { value: "unknown", label: "Not sure" },
                ]}
                value={s.priceStatus ? [s.priceStatus] : []}
                onChange={(v) => set("priceStatus", (v[0] as PriceStatus) ?? "")}
                error={errors.priceStatus}
              />
              {s.priceStatus === "paid" && (
                <div style={{ animation: "rise .4s var(--ease-out-expo) both" }}>
                  <TextField id="priceMin" label="Lowest ticket price" optional prefix="₹" inputMode="numeric" placeholder="499" value={s.priceMin} onChange={(e) => set("priceMin", e.target.value.replace(/[^\d]/g, ""))} error={errors.priceMin} />
                </div>
              )}
              <ChipGroup id="types" legend="What kind of event?" optional multiple options={EVENT_TYPES.map((t) => ({ value: t, label: EVENT_TYPE_META[t].label }))} value={s.types} onChange={(v) => set("types", v)} />
              <ChipGroup id="music" legend="Music" optional multiple options={MUSIC_STYLES.map((m) => ({ value: m, label: MUSIC_META[m] }))} value={s.music} onChange={(v) => set("music", v)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField id="organizer" label="Organizer" optional placeholder="Society, club or company" value={s.organizerName} onChange={(e) => set("organizerName", e.target.value)} maxLength={120} />
                <TextField id="booking" type="url" label="Booking link" optional placeholder="https://…" value={s.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} error={errors.bookingUrl} hint="We verify every link before showing a Book button." />
              </div>
            </Step>
          )}

          {current.id === "event" && (
            <Step title="Which listing needs fixing?" lead="Search by name or locality." headingRef={heading}>
              <EventPicker events={events} value={s.eventSlug} onChange={(v) => set("eventSlug", v)} error={errors.event} />
            </Step>
          )}

          {current.id === "issue" && (
            <Step title="What’s wrong?" lead="Tell us what the listing gets wrong and what’s actually correct." headingRef={heading}>
              <ChipGroup id="fields" legend="Which details?" multiple options={CORRECTION_FIELDS.map((f) => ({ value: f, label: f }))} value={s.fields} onChange={(v) => set("fields", v)} error={errors.fields} />
              <TextArea
                id="details"
                label="The correct information"
                placeholder="e.g. Tickets now start at ₹599, and the Saturday night moved to the Sector 12 ground."
                value={s.details}
                onChange={(e) => set("details", e.target.value)}
                error={errors.details}
                maxLength={2000}
                hint={`${s.details.length}/2000`}
              />
            </Step>
          )}

          {current.id === "evidence" && (
            <Step title="Show us where it’s from" lead="A poster, ticket page, RWA notice or official post. Moderators check every source." headingRef={heading}>
              <fieldset className="grid gap-3" aria-describedby={errors.links || errors.evidence ? "links-error" : undefined}>
                <legend className="mb-1 text-sm font-bold">Links</legend>
                {s.links.map((l, i) => (
                  <div key={i} className="relative">
                    <Icon name="link" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="url"
                      aria-label={`Evidence link ${i + 1}`}
                      placeholder={i === 0 ? "https://instagram.com/p/… or ticket page" : "Another link (optional)"}
                      value={l}
                      aria-invalid={(!!errors.links && !!l) || (!!errors.evidence && i === 0) || undefined}
                      onChange={(e) => {
                        const links = [...s.links];
                        links[i] = e.target.value;
                        set("links", links);
                        setErrors((x) => {
                          const n = { ...x };
                          delete n.evidence;
                          return n;
                        });
                      }}
                      className="w-full rounded-2xl border-[1.5px] border-ink/20 bg-card py-3 pl-11 pr-4 text-[0.95rem] font-medium outline-none transition-[border-color,box-shadow] placeholder:text-ink-faint hover:border-ink/50 focus:border-ink focus:shadow-[var(--shadow-print-sm)] aria-[invalid=true]:border-sindoor"
                    />
                  </div>
                ))}
                {s.links.length < 3 && (
                  <button type="button" className="justify-self-start text-xs font-bold underline underline-offset-4" onClick={() => set("links", [...s.links, ""])}>
                    + Add another link
                  </button>
                )}
                <FieldError id="links-error" error={errors.links ?? errors.evidence} />
              </fieldset>

              <FileDrop
                files={files}
                error={errors.files}
                onChange={(f) => {
                  setFiles(f);
                  setErrors((x) => {
                    const n = { ...x };
                    delete n.files;
                    delete n.evidence;
                    return n;
                  });
                }}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField id="email" type="email" label="Your email" optional placeholder="So we can ask a follow-up" value={s.email} onChange={(e) => set("email", e.target.value)} error={errors.email} autoComplete="email" hint="Never shown publicly." />
                <TextField id="note" label="Note for the moderator" optional value={s.note} onChange={(e) => set("note", e.target.value)} error={errors.note} maxLength={2000} />
              </div>
            </Step>
          )}

          {current.id === "review" && (
            <Step title="Look good?" lead="This goes to a moderator. You’ll see it on the site only after it’s checked." headingRef={heading}>
              <Review s={s} files={files} events={events} onEdit={goTo} />
              <label className={cx("flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] p-4", errors.confirm ? "border-sindoor" : "border-ink/15")}>
                <input
                  type="checkbox"
                  checked={s.confirm}
                  onChange={(e) => set("confirm", e.target.checked)}
                  aria-invalid={!!errors.confirm || undefined}
                  aria-describedby={errors.confirm ? "confirm-error" : undefined}
                  className="mt-0.5 size-5 accent-[var(--color-sindoor)]"
                />
                <span className="text-sm">
                  <b>This is accurate to the best of my knowledge</b>, and I’m not affiliated with the event in a way I haven’t mentioned.
                </span>
              </label>
              <FieldError id="confirm-error" error={errors.confirm} />
              {serverMsg && (
                <p role="alert" className="rounded-2xl border-[1.5px] border-sindoor bg-sindoor-soft px-4 py-3 text-sm font-bold text-sindoor-deep">
                  {serverMsg}
                </p>
              )}
            </Step>
          )}
        </div>

        {/* Nav */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t-[1.5px] border-dashed border-ink/20 bg-card/95 px-5 py-4 backdrop-blur md:static md:px-8 md:py-5">
          {step > 0 ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={back} disabled={pending}>
              <Icon name="arrowLeft" size={15} /> Back
            </button>
          ) : (
            <span className="text-xs font-semibold text-ink-faint">Takes about 2 minutes</span>
          )}
          {current.id === "review" ? (
            <button type="submit" className="btn btn-red" disabled={pending}>
              {pending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-cream border-t-transparent" aria-hidden="true" /> Sending…
                </>
              ) : (
                <>
                  Send for review <Icon name="arrowRight" className="btn-arrow" />
                </>
              )}
            </button>
          ) : (
            <button type="submit" className="btn">
              Continue <Icon name="arrowRight" className="btn-arrow" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Step({ title, lead, children, headingRef }: { title: string; lead: string; children: React.ReactNode; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="grid gap-7">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="t-h2 !text-[clamp(1.6rem,3vw,2.3rem)] outline-none">
          {title}
        </h2>
        <p className="t-body mt-2 text-ink-soft">{lead}</p>
      </div>
      {children}
    </div>
  );
}

function EventPicker({ events, value, onChange, error }: { events: PickableEvent[]; value: string | null; onChange: (v: string | null) => void; error?: string }) {
  const [q, setQ] = useState("");
  const chosen = events.find((e) => e.slug === value);
  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    return events.filter((e) => !t || `${e.title} ${e.locality} ${AREA_META[e.area].label}`.toLowerCase().includes(t)).slice(0, 8);
  }, [events, q]);

  if (chosen)
    return (
      <div className="flex items-center gap-4 rounded-[var(--radius-card)] border-[1.5px] border-ink bg-haldi-soft p-4" style={{ animation: "scale-in .3s var(--ease-out-expo) both" }}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-card">
          <Icon name="check" size={18} strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{chosen.title}</p>
          <p className="t-meta text-ink-soft">
            {chosen.locality}, {AREA_META[chosen.area].label}
            {chosen.firstDate ? ` · from ${formatDay(chosen.firstDate)}` : ""}
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(null)}>
          Change
        </button>
      </div>
    );

  return (
    <div className="grid gap-3">
      <TextField id="event-search" label="Find the listing" placeholder="Event name or locality" value={q} onChange={(e) => setQ(e.target.value)} error={error} autoComplete="off" />
      <ul className="grid gap-1.5" aria-label="Matching listings">
        {list.map((e) => (
          <li key={e.slug}>
            <button type="button" onClick={() => onChange(e.slug)} className="flex w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] border-ink/10 px-4 py-3 text-left transition-colors hover:border-ink">
              <span className="min-w-0">
                <span className="block truncate font-bold">{e.title}</span>
                <span className="t-meta text-ink-soft">
                  {e.locality}, {AREA_META[e.area].label}
                </span>
              </span>
              <Icon name="arrowRight" size={16} className="shrink-0 text-sindoor" />
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl border-[1.5px] border-dashed border-ink/20 px-4 py-6 text-center text-sm text-ink-soft">No listing matches “{q}”. Maybe suggest it as a new event?</li>}
      </ul>
    </div>
  );
}

function FileDrop({ files, onChange, error }: { files: File[]; onChange: (f: File[]) => void; error?: string }) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const total = files.reduce((n, f) => n + f.size, 0);
  const add = (list: FileList | null) => {
    if (!list) return;
    onChange([...files, ...Array.from(list)].slice(0, MAX_FILES + 2));
  };
  return (
    <div className="grid gap-2">
      <p className="flex items-baseline justify-between text-sm font-bold">
        Files <span className="text-xs font-semibold text-ink-faint">Optional · up to {MAX_FILES}, {bytes(MAX_TOTAL_BYTES)} total</span>
      </p>
      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={cx(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-[1.5px] border-dashed px-4 py-8 text-center transition-colors",
          over ? "border-ink bg-haldi-soft" : error ? "border-sindoor" : "border-ink/25",
        )}
      >
        <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-ink bg-paper-2">
          <Icon name="upload" size={18} />
        </span>
        <p className="text-sm font-semibold">
          Drop a poster or screenshot, or{" "}
          <button type="button" className="font-extrabold text-sindoor underline underline-offset-4" onClick={() => input.current?.click()}>
            browse
          </button>
        </p>
        <p className="text-xs text-ink-faint">JPG, PNG, WebP, HEIC or PDF</p>
        <input ref={input} type="file" multiple accept={ACCEPTED_TYPES.join(",")} className="sr-only" aria-label="Upload evidence files" onChange={(e) => add(e.target.files)} />
      </div>
      {files.length > 0 && (
        <ul className="grid gap-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-paper-2 px-3 py-2 text-sm" style={{ animation: "rise .3s var(--ease-out-expo) both" }}>
              <Icon name={f.type === "application/pdf" ? "info" : "eye"} size={15} className="text-ink-soft" />
              <span className="min-w-0 flex-1 truncate font-semibold">{f.name}</span>
              <span className="text-xs text-ink-faint">{bytes(f.size)}</span>
              <button type="button" className="icon-btn !size-7" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))}>
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
          <li className={cx("text-right text-xs font-semibold", total > MAX_TOTAL_BYTES ? "text-sindoor" : "text-ink-faint")}>{bytes(total)} of {bytes(MAX_TOTAL_BYTES)}</li>
        </ul>
      )}
      <FieldError id="files-error" error={error} />
    </div>
  );
}

function Review({ s, files, events, onEdit }: { s: State; files: File[]; events: PickableEvent[]; onEdit: (id: StepId) => void }) {
  const rows: { step: StepId; label: string; value: string }[] =
    s.kind === "correction"
      ? [
          { step: "event", label: "Listing", value: events.find((e) => e.slug === s.eventSlug)?.title ?? "—" },
          { step: "issue", label: "What’s wrong", value: s.fields.join(", ") || "—" },
          { step: "issue", label: "Correct info", value: s.details || "—" },
        ]
      : [
          { step: "basics", label: "Event", value: s.title || "—" },
          { step: "basics", label: "Where", value: [s.venueName, s.locality, s.area ? AREA_META[s.area].label : ""].filter(Boolean).join(", ") || "—" },
          { step: "when", label: "Nights", value: [...s.dates].sort().map((d) => formatDay(d)).join(", ") || "—" },
          { step: "when", label: "Time", value: s.startTime ? `${s.startTime}${s.endTime ? ` – ${s.endTime}` : ""}` : "Not sure" },
          {
            step: "details",
            label: "Entry",
            value: s.priceStatus === "free" ? "Free" : s.priceStatus === "paid" ? (s.priceMin ? `Paid · from ₹${s.priceMin}` : "Paid · price not given") : "Not sure",
          },
          { step: "details", label: "Type & music", value: [...s.types.map((t) => EVENT_TYPE_META[t].label), ...s.music.map((m) => MUSIC_META[m])].join(", ") || "—" },
        ];
  rows.push({ step: "evidence", label: "Evidence", value: [...s.links.filter(Boolean), ...files.map((f) => f.name)].join(", ") || "—" });
  return (
    <dl className="divide-y-[1.5px] divide-dashed divide-ink/10 rounded-[var(--radius-card)] border-[1.5px] border-ink/15">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[6.5rem_1fr_auto] items-start gap-3 px-4 py-3 sm:grid-cols-[9rem_1fr_auto]">
          <dt className="t-label pt-0.5 text-ink-soft">{r.label}</dt>
          <dd className="min-w-0 break-words text-sm font-semibold">{r.value}</dd>
          <button type="button" className="text-xs font-bold text-sindoor underline underline-offset-4" onClick={() => onEdit(r.step)} aria-label={`Edit ${r.label}`}>
            Edit
          </button>
        </div>
      ))}
    </dl>
  );
}

function Success({ id, kind, onAgain, headingRef }: { id: string; kind: Kind; onAgain: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-panel)] border-[1.5px] border-ink bg-card px-6 py-14 text-center shadow-[var(--shadow-print-lg)] md:py-20" role="status">
      <div className="relative mx-auto size-44">
        <div className="absolute inset-0" style={{ animation: "scale-in 1.2s var(--ease-out-expo) both" }}>
          <div className="h-full w-full motion-safe:animate-spin-slow">
            <Rangoli seed={42} size={400} rings={5} colors={["#bd1f1a", "#f3b61f", "#1f2f6d", "#3c6a32"]} strokeWidth={1.4} />
          </div>
        </div>
        <span className="absolute inset-[34%] grid place-items-center rounded-full border-[1.5px] border-ink bg-mehendi text-cream" style={{ animation: "pop .6s var(--ease-out-expo) .5s both" }}>
          <Icon name="check" size={30} strokeWidth={3} />
        </span>
      </div>
      <span className="mt-6 inline-block rotate-[-6deg] rounded-md border-2 border-sindoor px-3 py-1 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-sindoor" style={{ animation: "stamp .6s var(--ease-out-expo) .8s both" }}>
        Received
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="t-h2 mt-5 outline-none">
        {kind === "correction" ? "Thanks — correction sent." : "Thanks — it’s in the queue."}
      </h2>
      <p className="t-body mx-auto mt-3 max-w-md text-ink-soft">A moderator will check the sources before anything changes on the site. Reference: <b className="font-mono text-ink">{id.slice(0, 8).toUpperCase()}</b></p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/events" className="btn btn-red">
          Browse events <Icon name="arrowRight" className="btn-arrow" />
        </Link>
        <button type="button" className="btn btn-outline" onClick={onAgain}>
          Submit another
        </button>
      </div>
    </div>
  );
}
