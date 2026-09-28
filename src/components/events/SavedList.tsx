"use client";

import Link from "next/link";
import { useSaved } from "@/lib/saved";
import type { EventRecord } from "@/lib/types";
import { EmptyState } from "../ui/States";
import { EventCard } from "./cards";

export function SavedList({ events }: { events: EventRecord[] }) {
  const saved = useSaved();
  const list = saved.map((slug) => events.find((e) => e.slug === slug)).filter((e): e is EventRecord => !!e);
  if (list.length === 0)
    return (
      <EmptyState
        title="Nothing saved yet."
        body="Tap the bookmark on any event to build your Navratri plan. Saved events stay on this device."
        action={
          <Link href="/events" className="btn btn-red">
            Find events
          </Link>
        }
      />
    );
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((e, i) => (
        <li key={e.slug} style={{ animation: `rise .6s var(--ease-out-expo) ${i * 50}ms both` }}>
          <EventCard event={e} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
