"use client";

import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Visible group label. */
  legend: string;
  /** Unique radio-group name. */
  name: string;
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/**
 * Accessible segmented control built on native radio inputs, so keyboard
 * navigation (arrow keys), focus and form semantics come for free.
 * Used for the GST mode and the tax-type choice.
 */
export function SegmentedControl<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {legend}
      </legend>
      <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-control border border-line bg-surface-sunken p-1">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-w-0 cursor-pointer select-none items-center justify-center rounded-[9px] px-3 py-2.5 text-center text-sm font-medium transition-colors duration-150",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                checked ? "bg-surface text-text shadow-raise" : "text-muted hover:text-text",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
