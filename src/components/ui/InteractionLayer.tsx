"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One tiny global client component that powers:
 *  - scroll reveals for any [data-reveal] element (IntersectionObserver)
 *  - pointer-aware card shine (sets --mx/--my on [data-shine])
 *  - the scroll offset (--sy) that drives CSS parallax on [data-parallax] elements
 * Everything degrades to static content without JS or with reduced motion.
 */
export function InteractionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = "true";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const observeAll = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== "mouse") return;
      const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-shine]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
      el.style.setProperty("--my", `${ev.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    // Parallax is pure CSS (see [data-parallax] in globals.css); we only publish the scroll offset
    // on <html>, never touching React-managed nodes.
    let raf = 0;
    const root = document.documentElement;
    const parallax = () => {
      raf = 0;
      const y = window.scrollY;
      root.dataset.scrolled = y > 24 ? "true" : "false";
      if (!reduce && y < window.innerHeight * 1.6) root.style.setProperty("--sy", `${Math.round(y)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(parallax);
    };
    parallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
