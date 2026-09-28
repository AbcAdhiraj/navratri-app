import Link from "next/link";
import { EmptyState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-36">
      <EmptyState
        title="This page stepped out of the circle."
        body="The link may be old or mistyped. Tonight’s events are just a tap away."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-red">
              Back to Explore
            </Link>
            <Link href="/events" className="btn btn-outline">
              All events
            </Link>
          </div>
        }
      />
    </div>
  );
}
