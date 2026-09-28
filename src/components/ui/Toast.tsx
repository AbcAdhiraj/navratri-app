"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ToastItem {
  id: number;
  message: string;
}
const Ctx = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const n = useRef(0);
  const push = useCallback((message: string) => {
    const id = ++n.current;
    setItems((x) => [...x.slice(-2), { id, message }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 2600);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-print-sm)]"
            style={{ animation: "scale-in .35s var(--ease-out-expo) both" }}
          >
            <span className="grid size-5 place-items-center rounded-full bg-haldi text-ink">
              <Icon name="check" size={12} strokeWidth={3} />
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
