"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** bottom sheet on mobile; `side` = drawer on desktop, `center` = modal on desktop, `full` = fullscreen everywhere */
  variant?: "bottom" | "side" | "center" | "full";
  children: ReactNode;
  footer?: ReactNode;
  hideHeader?: boolean;
  labelledBy?: string;
}

/**
 * Accessible sheet built on native <dialog>: focus is trapped and restored by the browser,
 * Escape closes, background is inert. Animates via @starting-style in globals.css.
 */
export function Sheet({ open, onClose, title, variant = "bottom", children, footer, hideHeader }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onCloseEvt = () => {
      document.documentElement.style.overflow = "";
      if (open) onClose();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("close", onCloseEvt);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("close", onCloseEvt);
    };
  }, [onClose, open]);

  const cls = variant === "side" ? "sheet sheet-side" : variant === "center" ? "sheet sheet-center" : variant === "full" ? "sheet sheet-full" : "sheet";

  return (
    <dialog
      ref={ref}
      className={cls}
      aria-label={title}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex max-h-[inherit] min-h-0 flex-col" style={variant === "full" || variant === "side" ? { height: "100%" } : undefined}>
        {!hideHeader && (
          <header className="relative flex shrink-0 items-center justify-between gap-4 px-5 pb-3 pt-4 md:px-6">
            {variant === "bottom" || variant === "center" ? (
              <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/20 md:hidden" aria-hidden="true" />
            ) : null}
            <h2 className="t-h3 pt-2">{title}</h2>
            <button type="button" className="icon-btn mt-1 border-[1.5px] border-ink/20 hover:border-ink" onClick={onClose} aria-label="Close">
              <Icon name="x" />
            </button>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 md:px-6">{children}</div>
        {footer && <footer className="safe-bottom shrink-0 border-t-[1.5px] border-ink/10 bg-paper px-5 pt-4 md:px-6">{footer}</footer>}
      </div>
    </dialog>
  );
}
