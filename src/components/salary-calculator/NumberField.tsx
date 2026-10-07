"use client";

import { useCallback, useId, useRef } from "react";
import { X } from "lucide-react";
import { groupIndianDigits } from "@/lib/salary";
import { cn } from "@/lib/cn";

interface NumberFieldProps {
  label: string;
  /** Raw value: digits and at most one dot. */
  value: string;
  onChange: (raw: string) => void;
  /** "rupees" groups digits the Indian way and shows ₹; "percent" shows %. */
  unit: "rupees" | "percent";
  /** "hero" is the large CTC field; "compact" the secondary inputs. */
  size?: "hero" | "compact";
  placeholder?: string;
  hint?: string | null;
  clearLabel?: string;
  invalid?: boolean;
  /** Id of the shared error message, linked while `invalid`. */
  describedBy?: string;
}

/** Keep digits and one dot, at most 2 decimals; "007" -> "7", ".5" -> "0.5". */
function sanitize(input: string): string {
  let s = input.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    const head = s.slice(0, dot).replace(/\./g, "");
    const tail = s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    s = `${head}.${tail}`;
  }
  if (s.startsWith(".")) s = `0${s}`;
  return s.replace(/^0+(?=\d)/, "");
}

function toDisplay(raw: string, unit: NumberFieldProps["unit"]): string {
  if (raw === "" || unit === "percent") return raw;
  const [intPart, decPart] = raw.split(".");
  const grouped = groupIndianDigits(intPart === "" ? "0" : intPart);
  return raw.includes(".") ? `${grouped}.${decPart ?? ""}` : grouped;
}

/**
 * The Salary Calculator's number input — the same live digit grouping,
 * caret handling and Escape-to-clear as the GST amount field, in two
 * sizes: the large CTC field and the compact secondary inputs.
 */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  size = "compact",
  placeholder,
  hint,
  clearLabel,
  invalid = false,
  describedBy,
}: NumberFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hero = size === "hero";
  const filled = value !== "";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      const previous = el.value;
      const caret = el.selectionStart ?? previous.length;
      const digitsLeftOfCaret = previous.slice(0, caret).replace(/[^\d.]/g, "").length;

      const raw = sanitize(previous);
      onChange(raw);

      const next = toDisplay(raw, unit);
      requestAnimationFrame(() => {
        const node = inputRef.current;
        if (!node || document.activeElement !== node) return;
        let pos = 0;
        let seen = 0;
        while (pos < next.length && seen < digitsLeftOfCaret) {
          if (/[\d.]/.test(next[pos])) seen += 1;
          pos += 1;
        }
        node.setSelectionRange(pos, pos);
      });
    },
    [onChange, unit],
  );

  const clear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const describedByIds = [hint ? hintId : null, invalid ? describedBy : null].filter(Boolean).join(" ");

  return (
    <div className="min-w-0">
      <label
        htmlFor={inputId}
        className="mb-2 block px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </label>

      <div
        className={cn(
          "flex items-center gap-2 rounded-control border bg-surface",
          hero ? "pl-4 pr-2" : "px-3",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20",
          invalid ? "border-danger focus-within:ring-danger/20" : "border-line-strong",
        )}
      >
        {unit === "rupees" && (
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 font-mono transition-colors duration-150",
              hero ? "text-2xl sm:text-3xl" : "text-base",
              filled ? "text-text" : "text-muted",
            )}
          >
            ₹
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={placeholder ?? "0"}
          value={toDisplay(value, unit)}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Escape" && filled) {
              event.preventDefault();
              clear();
            }
          }}
          aria-invalid={invalid}
          aria-describedby={describedByIds || undefined}
          className={cn(
            "w-full min-w-0 bg-transparent font-mono tabular-nums tracking-tight text-text outline-none placeholder:text-muted/40",
            hero ? "py-4 text-3xl sm:text-4xl" : "py-2.5 text-base",
          )}
        />
        {unit === "percent" && (
          <span aria-hidden="true" className="shrink-0 font-mono text-base text-muted">
            %
          </span>
        )}
        {hero && clearLabel && (
          <button
            type="button"
            onClick={clear}
            aria-label={clearLabel}
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
        )}
      </div>

      {hint && (
        <p id={hintId} className="mt-1.5 px-1 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
