"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export function LoginForm({ mode }: { mode: "supabase" | "password" | "open" | "closed" }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  if (mode === "closed")
    return <p className="rounded-2xl border-[1.5px] border-dashed border-ink/30 p-4 text-sm text-ink-soft">Admin isn’t available here: connect Supabase (see README) or set ADMIN_DEMO_PASSWORD for a preview.</p>;
  return (
    <form action={action} className="grid gap-4">
      {mode === "supabase" && (
        <label className="grid gap-1.5 text-sm font-bold">
          Email
          <input name="email" type="email" required autoComplete="email" className="rounded-xl border-[1.5px] border-ink/25 bg-card px-4 py-3 font-medium outline-none focus:border-ink" />
        </label>
      )}
      {mode !== "open" && (
        <label className="grid gap-1.5 text-sm font-bold">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="rounded-xl border-[1.5px] border-ink/25 bg-card px-4 py-3 font-medium outline-none focus:border-ink" />
        </label>
      )}
      {state.error && (
        <p role="alert" className="text-sm font-bold text-sindoor">
          {state.error}
        </p>
      )}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Signing in…" : mode === "open" ? "Enter demo admin" : "Sign in"}
      </button>
    </form>
  );
}
