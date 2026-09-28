"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "./Icon";

export function RetryButton({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-red btn-sm"
      disabled={pending}
      onClick={() => {
        onRetry?.();
        start(() => router.refresh());
      }}
    >
      <Icon name="refresh" size={16} className={pending ? "animate-spin" : undefined} />
      {pending ? "Trying…" : "Try again"}
    </button>
  );
}
