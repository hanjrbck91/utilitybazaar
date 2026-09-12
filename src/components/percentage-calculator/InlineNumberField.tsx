"use client";

import { useCallback, useId, useRef } from "react";
import { X } from "lucide-react";
import { formatNumber } from "@/lib/percentage";
import { cn } from "@/lib/cn";

interface InlineNumberFieldProps {
  /** Accessible name — the field has no visible label, only the sentence around it. */
  ariaLabel: string;
  /** A contextual example shown when empty (e.g. "e.g. 12") — help text only. */
  placeholder: string;
  /** Raw numeric string the user has typed (digits, optional single dot, optional leading "-"). */
  value: string;
  onChange: (raw: string) => void;
  onClear: () => void;
  hasError: boolean;
  /** Id of the shared error message this field's error state describes. */
  describedBy: string;
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
 * A small numeric input meant to sit inline inside a sentence
 * ("What is [ ]% of [ ]?") rather than above a block label. Same
 * interaction as the GST calculator's amount field — live Indian digit
 * grouping, Escape-to-clear, an inline clear button once filled — just
 * sized and styled to read as a blank in a question, not a form field.
 */
export function InlineNumberField({
  ariaLabel,
  placeholder,
  value,
  onChange,
  onClear,
  hasError,
  describedBy,
}: InlineNumberFieldProps) {
  const inputId = useId();
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

  const filled = value !== "";

  return (
    <span
      className={cn(
        "relative inline-flex items-center rounded-control border bg-surface",
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
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={toDisplay(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-invalid={hasError}
        aria-describedby={hasError ? describedBy : undefined}
        className={cn(
          "w-20 min-w-0 bg-transparent py-2 pl-3 font-mono text-base tabular-nums tracking-tight text-text outline-none sm:w-24 sm:text-lg",
          filled ? "pr-7" : "pr-3",
          "placeholder:font-sans placeholder:text-xs placeholder:tracking-normal placeholder:text-muted/50",
        )}
      />
      {filled && (
        <button
          type="button"
          onClick={clearAndFocus}
          aria-label={`× ${ariaLabel}`}
          className={cn(
            "absolute right-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill text-muted",
            "transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
