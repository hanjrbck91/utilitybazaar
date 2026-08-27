"use client";

import { useCallback, useId, useRef } from "react";
import { X } from "lucide-react";
import { groupIndianDigits } from "@/lib/gst";
import { cn } from "@/lib/cn";

interface AmountFieldProps {
  /** Raw numeric string the user has typed (digits + optional single dot). */
  value: string;
  onChange: (raw: string) => void;
  onClear: () => void;
  /** Validation message, shown only once the user has entered something. */
  error?: string | null;
}

/** Keep only digits and a single dot, cap at 2 decimals, normalise ".5" -> "0.5". */
function sanitize(input: string): string {
  let s = input.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    const head = s.slice(0, dot).replace(/\./g, "");
    const tail = s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    s = `${head}.${tail}`;
  }
  if (s.startsWith(".")) s = `0${s}`;
  // strip a leading zero run like "007" -> "7" but keep "0" and "0.x"
  s = s.replace(/^0+(?=\d)/, "");
  return s;
}

/** Render the raw value with Indian digit grouping, preserving a trailing dot. */
function toDisplay(raw: string): string {
  if (raw === "") return "";
  const [intPart, decPart] = raw.split(".");
  const grouped = groupIndianDigits(intPart === "" ? "0" : intPart);
  if (raw.includes(".")) return `${grouped}.${decPart ?? ""}`;
  return grouped;
}

export function AmountField({ value, onChange, onClear, error }: AmountFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      const previous = el.value;
      const caret = el.selectionStart ?? previous.length;
      const digitsLeftOfCaret = previous.slice(0, caret).replace(/\D/g, "").length;

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
        Amount
      </label>

      <div
        className={cn(
          "flex items-center gap-2 rounded-control border bg-surface pl-4 pr-2",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20",
          hasError
            ? "border-danger focus-within:ring-danger/20"
            : "border-line-strong",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 font-mono text-2xl transition-colors duration-150 sm:text-3xl",
            filled ? "text-text" : "text-muted",
          )}
        >
          ₹
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder="0"
          value={toDisplay(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            "w-full min-w-0 bg-transparent py-4 font-mono text-3xl tabular-nums tracking-tight text-text outline-none",
            "placeholder:text-muted/40 sm:text-4xl",
          )}
        />
        <button
          type="button"
          onClick={clearAndFocus}
          aria-label="Clear amount"
          aria-hidden={!filled}
          tabIndex={filled ? 0 : -1}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-pill text-muted",
            "transition-[opacity,color,background-color,transform] duration-150 ease-out",
            "hover:bg-surface-sunken hover:text-text active:scale-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            filled ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
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
