import type { ReactNode } from "react";

/** Long-form text column for policy / methodology pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 md:px-8 [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-ink-soft [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-soft">
      {children}
    </div>
  );
}
