"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-36">
      <EmptyState
        title="Something went sideways."
        body="We couldn’t load this right now. It’s us, not you — give it another go."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-red btn-sm" onClick={reset}>
              <Icon name="refresh" size={16} /> Try again
            </button>
            <Link href="/" className="btn btn-outline btn-sm">
              Back home
            </Link>
          </div>
        }
      />
    </div>
  );
}
