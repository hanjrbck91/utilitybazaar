"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type RateSelection = number | "custom";

interface RateSelectorProps {
  /** Suggested quick-pick rates (UI hint only — not authoritative). */
  presets: ReadonlyArray<number>;
  selection: RateSelection;
  customValue: string;
  onSelectPreset: (rate: number) => void;
  onSelectCustom: () => void;
  onCustomValueChange: (value: string) => void;
  error?: string | null;
}

function sanitizeRate(input: string): string {
  let s = input.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    s = `${s.slice(0, dot).replace(/\./g, "")}.${s.slice(dot + 1).replace(/\./g, "").slice(0, 2)}`;
  }
  return s;
}

export function RateSelector({
  presets,
  selection,
  customValue,
  onSelectPreset,
  onSelectCustom,
  onCustomValueChange,
  error,
}: RateSelectorProps) {
  const customInputRef = useRef<HTMLInputElement>(null);
  const customActive = selection === "custom";

  useEffect(() => {
    if (customActive) customInputRef.current?.focus();
  }, [customActive]);

  const hasError = Boolean(error) && customActive && customValue !== "";

  return (
    <fieldset>
      <legend className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        GST rate
      </legend>

      <div className="flex flex-wrap gap-2">
        {presets.map((rate) => {
          const checked = selection === rate;
          return (
            <label
              key={rate}
              className={cn(
                "cursor-pointer select-none rounded-pill border px-4 py-2.5 text-sm font-medium tabular-nums transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                checked
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line-strong text-muted hover:text-text",
              )}
            >
              <input
                type="radio"
                name="gst-rate"
                value={String(rate)}
                checked={checked}
                onChange={() => onSelectPreset(rate)}
                className="sr-only"
              />
              {rate}%
            </label>
          );
        })}

        <label
          className={cn(
            "flex cursor-pointer select-none items-center gap-1.5 rounded-pill border px-4 py-2.5 text-sm font-medium transition-colors",
            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
            customActive
              ? "border-accent bg-accent-soft text-accent"
              : "border-line-strong text-muted hover:text-text",
          )}
        >
          <input
            type="radio"
            name="gst-rate"
            value="custom"
            checked={customActive}
            onChange={onSelectCustom}
            className="sr-only"
          />
          Custom
        </label>
      </div>

      {customActive && (
        <div className="mt-3">
          <div
            className={cn(
              "flex w-32 items-center gap-1 rounded-control border bg-surface px-3 transition-colors",
              "focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15",
              hasError ? "border-danger" : "border-line-strong",
            )}
          >
            <input
              ref={customInputRef}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              aria-label="Custom GST rate, percent"
              aria-invalid={hasError}
              value={customValue}
              onChange={(event) =>
                onCustomValueChange(sanitizeRate(event.currentTarget.value))
              }
              className="w-full bg-transparent py-2 font-mono text-base tabular-nums text-text outline-none placeholder:text-muted/50"
            />
            <span aria-hidden="true" className="font-mono text-base text-muted">
              %
            </span>
          </div>
          {hasError && (
            <p role="alert" className="mt-1 px-1 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      )}

      <p className="mt-2 px-1 text-xs text-muted">
        Suggested rates are indicative. Confirm the rate that applies to your
        goods or service.
      </p>
    </fieldset>
  );
}
