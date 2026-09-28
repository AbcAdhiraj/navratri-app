import type { Metadata } from "next";
import { SavedList } from "@/components/events/SavedList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPublishedEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Saved events", robots: { index: false } };

export default async function SavedPage() {
  const { events } = await getPublishedEvents();
  return (
    <>
      <PageHeader kicker="Your plan" title="Saved" accent="for the nine nights." lead="Stored on this device only — no account needed." tone="haldi" />
      <div className="mx-auto max-w-[90rem] px-4 pb-28 pt-10 md:px-8 lg:px-12">
        <SavedList events={events} />
      </div>
    </>
  );
}
