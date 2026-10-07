"use client";

import { useId, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { type PfMode } from "@/lib/salary";
import { type SalaryDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { SegmentedControl } from "@/components/SegmentedControl";
import { cn } from "@/lib/cn";
import { Breakdown } from "./Breakdown";
import {
  computeView,
  ctcInLakhs,
  errorMessage,
  initialFormState,
  inputHints,
  type SalaryFormState,
} from "./model";
import { NumberField } from "./NumberField";
import { ResultCard } from "./ResultCard";

/**
 * CTC → in-hand salary. Annual CTC is the one required input and the
 * answer sits directly under it; the assumptions behind it (variable
 * pay, Basic + DA, PF) follow, and gratuity and professional tax wait
 * behind "More options". Every keystroke re-runs the engine through
 * `computeView` — there is no Calculate button, and no figure is
 * computed in this component.
 */
export function Calculator() {
  const d = useDictionary<SalaryDictionary>();
  const errorId = useId();
  const [form, setForm] = useState<SalaryFormState>(initialFormState);

  const set = <K extends keyof SalaryFormState>(key: K) => (value: SalaryFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const view = computeView(form);
  const hints = inputHints(d);
  const errorText = view.status === "error" ? errorMessage(d, view.field, view.code) : null;
  const invalid = (field: string) => view.status === "error" && view.field === field;

  const pfOptions: Array<{ value: PfMode; label: string }> = [
    { value: "full", label: d.calculator.pfFull },
    { value: "capped", label: d.calculator.pfCapped },
    { value: "none", label: d.calculator.pfNone },
  ];

  return (
    <>
      <section
        aria-label={d.app.calculatorLabel}
        className="mx-auto w-full rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <NumberField
          size="hero"
          unit="rupees"
          label={d.calculator.ctc}
          value={form.ctc}
          onChange={set("ctc")}
          placeholder={d.calculator.ctcPlaceholder}
          hint={ctcInLakhs(d, form.ctc) ?? d.calculator.ctcHint}
          clearLabel={d.calculator.clear}
          invalid={invalid("annualCtc")}
          describedBy={errorId}
        />

        <div className="mt-4">
          <ResultCard view={view} errorText={errorText} errorId={errorId} />
        </div>

        <div className="mt-6 space-y-5 border-t border-line pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              unit="percent"
              label={d.calculator.variablePayPercent}
              value={form.variablePayPercent}
              onChange={set("variablePayPercent")}
              placeholder={d.calculator.variablePayPlaceholder}
              hint={d.calculator.variablePayHint}
              invalid={invalid("variablePayPercent")}
              describedBy={errorId}
            />
            <NumberField
              unit="percent"
              label={d.calculator.pfWagesPercent}
              value={form.pfWagesPercent}
              onChange={set("pfWagesPercent")}
              hint={hints.pfWages}
              invalid={invalid("pfWagesPercent")}
              describedBy={errorId}
            />
          </div>

          <SegmentedControl<PfMode>
            legend={d.calculator.pfMode}
            name="salary-pf-mode"
            options={pfOptions}
            value={form.pfMode}
            onChange={set("pfMode")}
            hint={hints.pfMode[form.pfMode]}
          />

          <details className="group rounded-control border border-line bg-surface-sunken/50 px-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-text outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <span>
                {d.calculator.advanced}
                <span className="ml-2 text-xs font-normal text-muted">{d.calculator.optional}</span>
              </span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-180" />
            </summary>

            <div className="space-y-5 pb-4 pt-1 motion-safe:animate-fade-in">
              <p className="text-xs leading-relaxed text-muted">{d.calculator.advancedHint}</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.includeGratuity}
                  onChange={(event) => set("includeGratuity")(event.currentTarget.checked)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block text-sm font-medium text-text">{d.calculator.gratuityToggle}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{d.calculator.gratuityHint}</span>
                </span>
              </label>

              <NumberField
                unit="rupees"
                label={d.calculator.professionalTax}
                value={form.professionalTax}
                onChange={set("professionalTax")}
                placeholder={d.calculator.professionalTaxPlaceholder}
                hint={hints.professionalTax}
                invalid={invalid("professionalTaxAnnual")}
                describedBy={errorId}
              />
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted">
            <p>
              <span className="font-medium text-text">{d.calculator.taxRegime}:</span> {hints.taxRegime}
            </p>
            <button
              type="button"
              onClick={() => setForm(initialFormState())}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-pill px-2.5 font-medium text-muted transition-colors",
                "hover:bg-surface-sunken hover:text-text",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              {d.actions.reset}
            </button>
          </div>
        </div>
      </section>

      {view.status === "ok" && <Breakdown result={view.result} />}
    </>
  );
}
