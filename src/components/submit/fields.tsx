"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/format";
import { Icon } from "../ui/Icon";

export function FieldShell({ id, label, hint, error, optional, children }: { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-bold">
        {label}
        {optional && <span className="text-xs font-semibold text-ink-faint">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs font-bold text-sindoor" style={{ animation: "rise .3s var(--ease-out-expo) both" }}>
      <Icon name="alert" size={13} />
      {error}
    </p>
  );
}

const inputCls = (error?: string) =>
  cx(
    "w-full rounded-2xl border-[1.5px] bg-card px-4 py-3 text-[0.95rem] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-faint focus:border-ink focus:shadow-[var(--shadow-print-sm)]",
    error ? "border-sindoor" : "border-ink/20 hover:border-ink/50",
  );

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string; error?: string; optional?: boolean; prefix?: string };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ id, label, hint, error, optional, prefix, className, ...rest }, ref) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ink-soft">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cx(inputCls(error), prefix && "pl-9", className)}
          {...rest}
        />
      </div>
    </FieldShell>
  );
});

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; hint?: string; error?: string; optional?: boolean };

export function TextArea({ id, label, hint, error, optional, className, ...rest }: TextAreaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(inputCls(error), "min-h-32 resize-y leading-relaxed", className)}
        {...rest}
      />
    </FieldShell>
  );
}

/** Fieldset of toggle chips (single or multi select). */
export function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  multiple = false,
  error,
  id,
  optional,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  multiple?: boolean;
  error?: string;
  id: string;
  optional?: boolean;
}) {
  return (
    <fieldset className="grid gap-2" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-sm font-bold">
        {legend}
        {optional && <span className="text-xs font-semibold text-ink-faint">Optional</span>}
      </legend>
      <div className="flex flex-wrap gap-2" id={id}>
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              className="chip"
              aria-pressed={on}
              onClick={() => onChange(multiple ? (on ? value.filter((x) => x !== o.value) : [...value, o.value]) : on ? [] : [o.value])}
            >
              {on && <Icon name="check" size={13} strokeWidth={2.5} />}
              {o.label}
            </button>
          );
        })}
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </fieldset>
  );
}
