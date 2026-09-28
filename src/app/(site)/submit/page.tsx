import type { Metadata } from "next";
import { Torana } from "@/components/art/Motifs";
import { SubmissionForm, type PickableEvent } from "@/components/submit/SubmissionForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getPublishedEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Suggest an event or a correction",
  description: "Know a garba, dandiya or Navratri night in NCR we’re missing — or spotted a wrong detail? Send it with a source; a moderator checks everything before it goes live.",
  alternates: { canonical: "/submit" },
};

const NEXT: { icon: IconName; title: string; body: string }[] = [
  { icon: "upload", title: "You send it", body: "With a link, poster or notice as evidence." },
  { icon: "shield", title: "A moderator checks", body: "Against the organizer or ticketing page." },
  { icon: "check", title: "It goes live", body: "Only verified details are published." },
];

export default async function SubmitPage({ searchParams }: PageProps<"/submit">) {
  const [{ events }, sp] = await Promise.all([getPublishedEvents(), searchParams]);
  const kindParam = typeof sp.kind === "string" ? sp.kind : undefined;
  const eventParam = typeof sp.event === "string" ? sp.event : null;
  const kind = kindParam === "correction" || eventParam ? "correction" : kindParam === "new" ? "new_event" : null;
  const pickable: PickableEvent[] = events.map((e) => ({
    slug: e.slug,
    title: e.title,
    isDemo: e.isDemo,
    locality: e.venue.locality,
    area: e.venue.area,
    firstDate: e.occurrences[0]?.date ?? null,
  }));
  const validEvent = eventParam && pickable.some((p) => p.slug === eventParam) ? eventParam : null;

  return (
    <div className="bg-paper">
      <header className="on-dark relative overflow-hidden bg-neel pb-36 pt-[calc(var(--nav-h)+3.5rem)] md:pb-44">
        <div aria-hidden="true" className="bandhani-ring absolute inset-0 opacity-50" />
        <Torana aria-hidden="true" className="absolute inset-x-0 top-[var(--nav-h)] h-9 w-full text-cream/60" count={40} />
        <div className="relative z-10 mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
          <p className="kicker">Community</p>
          <h1 className="t-h1 mt-5 max-w-3xl text-balance">
            {kind === "correction" ? "Help us get it right." : "Know a garba we’re missing?"}
            <span className="t-serif text-haldi"> {kind === "correction" ? "Send the correct detail." : "Tell us."}</span>
          </h1>
          <p className="t-body mt-4 max-w-xl text-lg text-cream-dim">Every submission is reviewed by a person before anything changes. Nothing you send is published automatically.</p>
        </div>
      </header>

      <div className="relative z-10 mx-auto -mt-24 grid max-w-[90rem] gap-10 px-4 pb-28 md:-mt-32 md:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-12">
        <SubmissionForm events={pickable} initialKind={kind} initialEventSlug={validEvent} />
        <aside className="lg:pt-40" aria-label="What happens next">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <p className="kicker">What happens next</p>
            <ol className="relative mt-6 grid gap-6 before:absolute before:bottom-4 before:left-[1.2rem] before:top-4 before:w-[1.5px] before:bg-ink/15">
              {NEXT.map((n, i) => (
                <li key={n.title} className="relative flex gap-4">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-card">
                    <Icon name={n.icon} size={17} />
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-sindoor text-[0.6rem] font-extrabold text-cream">{i + 1}</span>
                  </span>
                  <span>
                    <span className="block font-bold">{n.title}</span>
                    <span className="t-meta text-ink-soft">{n.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="t-meta mt-8 rounded-2xl border-[1.5px] border-dashed border-ink/20 p-4 text-ink-soft">
              Your email (if you share it) is only used to ask a follow-up question. See our{" "}
              <a href="/privacy" className="font-bold text-ink underline underline-offset-2">
                privacy notice
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
