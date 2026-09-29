"use client";

import { useEffect } from "react";

/**
 * One tiny global client component that powers:
 *  - scroll reveals for [data-reveal] (Web Animations API — never mutates React-managed attributes)
 *  - pointer-aware card shine (sets --mx/--my on [data-shine])
 *  - the scroll offset (--sy) that drives CSS parallax on [data-parallax] elements
 * Everything degrades to static content without JS or with reduced motion.
 */
export function InteractionLayer() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll reveals via the Web Animations API: no attributes or classes are written to
    // React-managed nodes, so this can run before, during or after hydration safely.
    const HIDDEN: Keyframe = { opacity: 0, transform: "translate3d(0, 26px, 0)" };
    const holds = new WeakMap<Element, Animation>();
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          holds.get(el)?.cancel();
          const i = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
          el.animate([HIDDEN, { opacity: 1, transform: "none" }], { duration: 850, delay: Math.min(i, 6) * 70, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" });
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => {
      if (reduce) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.getBoundingClientRect().top < vh) return; // already on screen: leave it be
        holds.set(el, el.animate([HIDDEN, HIDDEN], { duration: 1, fill: "forwards" }));
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
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
  }, []);

  return null;
}
