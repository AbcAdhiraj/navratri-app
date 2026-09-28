"use client";

import { useSyncExternalStore } from "react";

const KEY = "navratri-ncr:saved";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(cache)) cache = [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function toggleSaved(slug: string) {
  const cur = read();
  const on = !cur.includes(slug);
  write(on ? [slug, ...cur] : cur.filter((s) => s !== slug));
  return on;
}

const EMPTY: string[] = [];
export function useSaved(): string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          cb();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    read,
    () => EMPTY,
  );
}

/* ── Grid / list preference (per device) ── */
const VIEW_KEY = "navratri-ncr:view";
const viewListeners = new Set<() => void>();
function readView(): "grid" | "list" {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}
export function useViewPreference(): ["grid" | "list", (v: "grid" | "list") => void] {
  const view = useSyncExternalStore(
    (cb) => {
      viewListeners.add(cb);
      return () => viewListeners.delete(cb);
    },
    readView,
    () => "grid" as const,
  );
  const set = (v: "grid" | "list") => {
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
    viewListeners.forEach((l) => l());
  };
  return [view, set];
}
