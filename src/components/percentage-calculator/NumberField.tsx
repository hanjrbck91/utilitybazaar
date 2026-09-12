"use client";

import { useCallback, useId, useRef } from "react";
import { X } from "lucide-react";
import { formatNumber } from "@/lib/percentage";
import { cn } from "@/lib/cn";

interface NumberFieldProps {
  label: string;
  clearLabel: string;
  /**
   * A contextual example shown when the field is empty (e.g. "e.g. 18") —
   * help text only, never written into `value` or used in a calculation.
   */
  placeholder: string;
  /** Raw numeric string the user has typed (digits, optional single dot, optional leading "-"). */
  value: string;
  onChange: (raw: string) => void;
  onClear: () => void;
  /** Localized validation message, shown only once the user has entered something. */
  error?: string | null;
}

/** Keep digits, a single dot and an optional leading "-", cap at 2 decimals. */
function sanitize(input: string): string {
  const negative = input.trim().startsWith("-");
  let s = input.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    const head = s.slice(0, dot).replace(/\./g, "");
    const tail = s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    s = `${head}.${tail}`;
  }
  if (s.startsWith(".")) s = `0${s}`;
  s = s.replace(/^0+(?=\d)/, "");
  return negative && s !== "" ? `-${s}` : s;
}

/** Render the raw value with Indian digit grouping, preserving sign and a trailing dot. */
function toDisplay(raw: string): string {
  if (raw === "" || raw === "-") return raw;
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [intPart, decPart] = unsigned.split(".");
  const grouped = formatNumber(intPart === "" ? 0 : Number(intPart));
  const withDecimal = unsigned.includes(".") ? `${grouped}.${decPart ?? ""}` : grouped;
  return negative ? `-${withDecimal}` : withDecimal;
}

/**
 * A single numeric input for the Percentage Calculator — plain numbers,
 * not currency, so there is no ₹ prefix and a leading "-" is allowed.
 * Otherwise the same interaction as the GST calculator's amount field:
 * live Indian digit grouping, a clear button, and Escape-to-clear.
 */
export function NumberField({
  label,
  clearLabel,
  placeholder,
  value,
  onChange,
  onClear,
  error,
}: NumberFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      const previous = el.value;
      const caret = el.selectionStart ?? previous.length;
      const digitsLeftOfCaret = previous.slice(0, caret).replace(/[^\d]/g, "").length;

      const raw = sanitize(previous);
      onChange(raw);

      const next = toDisplay(raw);
      requestAnimationFrame(() => {
        const node = inputRef.current;
        if (!node) return;
        let pos = 0;
        let seen = 0;
        while (pos < next.length && seen < digitsLeftOfCaret) {
          if (/\d/.test(next[pos])) seen += 1;
          pos += 1;
        }
        node.setSelectionRange(pos, pos);
      });
    },
    [onChange],
  );

  const clearAndFocus = useCallback(() => {
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" && value !== "") {
        event.preventDefault();
        clearAndFocus();
      }
    },
    [clearAndFocus, value],
  );

  const hasError = Boolean(error) && value !== "";
  const filled = value !== "";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </label>

      <div
        className={cn(
          "flex items-center gap-2 rounded-control border bg-surface pl-4 pr-2",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20",
          hasError ? "border-danger focus-within:ring-danger/20" : "border-line-strong",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={placeholder}
          value={toDisplay(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            "w-full min-w-0 bg-transparent py-4 font-mono text-2xl tabular-nums tracking-tight text-text outline-none",
            "sm:text-3xl",
            // The placeholder is a short example ("e.g. 12"), not a number
            // being typed — shrink it back to a plain, non-mono size so it
            // reads as a hint and never crowds or clips inside the field.
            "placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-muted/50",
          )}
        />
        {filled && (
          <button
            type="button"
            onClick={clearAndFocus}
            aria-label={clearLabel}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-pill text-muted",
              "transition-[color,background-color,transform] duration-150 ease-out",
              "hover:bg-surface-sunken hover:text-text active:scale-95",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p
        id={errorId}
        role={hasError ? "alert" : undefined}
        className="min-h-5 px-1 pt-1.5 text-xs text-danger motion-safe:transition-opacity"
      >
        {hasError ? error : null}
      </p>
    </div>
  );
}
