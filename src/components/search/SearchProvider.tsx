"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SearchItem } from "@/lib/discovery";
import { SearchOverlay } from "./SearchOverlay";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useSearch = () => useContext(Ctx);

export function SearchProvider({ items, focusDate, children }: { items: SearchItem[]; focusDate: string; children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  // Each opening gets a fresh overlay (empty query, first result active).
  const [session, setSession] = useState(0);
  const open = useCallback(() => {
    setSession((n) => n + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <SearchOverlay key={session} open={isOpen} onClose={close} items={items} focusDate={focusDate} />
    </Ctx.Provider>
  );
}
