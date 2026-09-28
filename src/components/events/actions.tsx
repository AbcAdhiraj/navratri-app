"use client";

import { toggleSaved, useSaved } from "@/lib/saved";
import { cx } from "@/lib/format";
import { Icon } from "../ui/Icon";
import { useToast } from "../ui/Toast";

const TONES = {
  paper: "border-[1.5px] border-ink/20 bg-card text-ink hover:border-ink",
  onColor: "border-[1.5px] border-cream/40 bg-transparent text-cream hover:border-cream",
  solid: "border-[1.5px] border-ink bg-card text-ink",
};

export function BookmarkButton({ slug, title, className, tone = "solid" }: { slug: string; title: string; className?: string; tone?: keyof typeof TONES }) {
  const saved = useSaved().includes(slug);
  const toast = useToast();
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const on = toggleSaved(slug);
        toast(on ? "Saved to your Navratri plan" : "Removed from saved");
      }}
      className={cx(
        "icon-btn z-10 transition-colors",
        !className?.includes("absolute") && "relative",
        TONES[tone],
        saved && "!border-sindoor !bg-sindoor !text-cream",
        className,
      )}
    >
      <Icon name="bookmark" size={17} fill={saved ? "currentColor" : "none"} style={saved ? { animation: "pop .4s var(--ease-out-expo)" } : undefined} />
    </button>
  );
}

export function ShareButton({ path, title, className, tone = "solid", label }: { path: string; title: string; className?: string; tone?: keyof typeof TONES; label?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      aria-label={label ? undefined : `Share ${title}`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = new URL(path, window.location.origin).toString();
        try {
          if (navigator.share) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          toast("Link copied");
        } catch {
          /* dismissed */
        }
      }}
      className={cx(label ? "btn btn-outline btn-sm" : cx("icon-btn z-10", TONES[tone]), !className?.includes("absolute") && "relative", className)}
    >
      <Icon name="share" size={17} />
      {label}
    </button>
  );
}
