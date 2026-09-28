import Link from "next/link";
import { EmptyState } from "@/components/ui/States";

export default function EventNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-36">
      <EmptyState
        title="We couldn’t find that event."
        body="It may have been renamed, cancelled or never published. Try browsing tonight’s events instead."
        action={
          <Link href="/events" className="btn btn-red">
            Browse events
          </Link>
        }
      />
    </div>
  );
}
