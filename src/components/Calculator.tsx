"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import {
  SUGGESTED_GST_RATES,
  tryCalculateGst,
  validateAmount,
  validateRate,
  type GstBreakdown,
  type GstMode,
  type TaxType,
} from "@/lib/gst";
import { AmountField } from "@/components/AmountField";
import { useDictionary } from "@/components/LocaleProvider";
import { RateSelector, type RateSelection } from "@/components/RateSelector";
import { ResultActions } from "@/components/ResultActions";
import { ResultCard } from "@/components/ResultCard";
import { SegmentedControl } from "@/components/SegmentedControl";

const PRESETS = SUGGESTED_GST_RATES;
const DEFAULT_RATE: RateSelection = PRESETS.includes(18) ? 18 : (PRESETS[0] ?? 18);

export function Calculator() {
  const d = useDictionary();

  const [rawAmount, setRawAmount] = useState("");
  const [mode, setMode] = useState<GstMode>("add");
  const [rateSelection, setRateSelection] = useState<RateSelection>(DEFAULT_RATE);
  const [customRate, setCustomRate] = useState("");
  const [taxType, setTaxType] = useState<TaxType>("intraState");

  const amountCheck = validateAmount(rawAmount);
  const rateInput = rateSelection === "custom" ? customRate : String(rateSelection);
  const rateCheck = validateRate(rateInput);

  let breakdown: GstBreakdown | null = null;
  if (amountCheck.valid && rateCheck.valid) {
    const result = tryCalculateGst({
      amount: amountCheck.value,
      mode,
      gstRate: rateCheck.value,
      taxType,
    });
    breakdown = result.ok ? result.data : null;
  }

  // Report that the tool was used, once per visit — not per keystroke.
  // Only the two enum choices travel; the amount and the result never do.
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current || !breakdown) return;
    reported.current = true;
    track("calculator_used", { mode: breakdown.mode, tax_type: breakdown.taxType });
  }, [breakdown]);

  const clear = () => {
    setRawAmount("");
    setCustomRate("");
  };

  const changeMode = (next: GstMode) => {
    setMode(next);
    track("gst_mode_changed", { mode: next });
  };

  const selectPreset = (rate: number) => {
    setRateSelection(rate);
    track("rate_selected", { rate_kind: "preset", rate });
  };

  const selectCustom = () => {
    setRateSelection("custom");
    // The custom rate's value is deliberately not reported.
    track("rate_selected", { rate_kind: "custom" });
  };

  const modeOptions = [
    { value: "add" as const, label: d.calculator.add, sublabel: d.calculator.addSub },
    { value: "remove" as const, label: d.calculator.remove, sublabel: d.calculator.removeSub },
  ];

  const taxTypeOptions = [
    { value: "intraState" as const, label: d.calculator.intraState },
    { value: "interState" as const, label: d.calculator.interState },
  ];

  return (
    <section
      aria-label={d.app.calculatorLabel}
      className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="space-y-5">
        <AmountField
          value={rawAmount}
          onChange={setRawAmount}
          onClear={clear}
          error={amountCheck.valid ? null : d.errors[amountCheck.code]}
        />

        <SegmentedControl<GstMode>
          legend={d.calculator.mode}
          name="gst-mode"
          options={modeOptions}
          value={mode}
          onChange={changeMode}
        />

        <RateSelector
          presets={PRESETS}
          selection={rateSelection}
          customValue={customRate}
          onSelectPreset={selectPreset}
          onSelectCustom={selectCustom}
          onCustomValueChange={setCustomRate}
          error={rateCheck.valid ? null : d.errors[rateCheck.code]}
        />

        <SegmentedControl<TaxType>
          legend={d.calculator.taxType}
          name="tax-type"
          options={taxTypeOptions}
          value={taxType}
          onChange={setTaxType}
          hint={
            taxType === "intraState"
              ? d.calculator.treatmentIntra
              : d.calculator.treatmentInter
          }
        />
      </div>

      <div className="mt-5">
        <ResultCard breakdown={breakdown} />
        {breakdown && (
          <div className="mt-4 motion-safe:animate-fade-in">
            <ResultActions breakdown={breakdown} />
          </div>
        )}
      </div>
    </section>
  );
}
