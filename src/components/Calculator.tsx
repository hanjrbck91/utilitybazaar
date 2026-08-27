"use client";

import { useState } from "react";
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
import { RateSelector, type RateSelection } from "@/components/RateSelector";
import { ResultCard } from "@/components/ResultCard";
import { SegmentedControl } from "@/components/SegmentedControl";

const PRESETS = SUGGESTED_GST_RATES;
const DEFAULT_RATE: RateSelection = PRESETS.includes(18) ? 18 : (PRESETS[0] ?? 18);

const MODE_OPTIONS = [
  { value: "add", label: "Add GST" },
  { value: "remove", label: "Remove GST" },
] as const satisfies ReadonlyArray<{ value: GstMode; label: string }>;

const TAX_TYPE_OPTIONS = [
  { value: "intraState", label: "Within state" },
  { value: "interState", label: "Other state" },
] as const satisfies ReadonlyArray<{ value: TaxType; label: string }>;

export function Calculator() {
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

  const clear = () => {
    setRawAmount("");
    setCustomRate("");
  };

  return (
    <section
      aria-label="GST calculator"
      className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="space-y-5">
        <AmountField
          value={rawAmount}
          onChange={setRawAmount}
          onClear={clear}
          error={amountCheck.valid ? null : amountCheck.message}
        />

        <SegmentedControl<GstMode>
          legend="Mode"
          name="gst-mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
        />

        <RateSelector
          presets={PRESETS}
          selection={rateSelection}
          customValue={customRate}
          onSelectPreset={setRateSelection}
          onSelectCustom={() => setRateSelection("custom")}
          onCustomValueChange={setCustomRate}
          error={rateCheck.valid ? null : rateCheck.message}
        />

        <SegmentedControl<TaxType>
          legend="Tax type"
          name="tax-type"
          options={TAX_TYPE_OPTIONS}
          value={taxType}
          onChange={setTaxType}
        />

        <ResultCard breakdown={breakdown} />
      </div>
    </section>
  );
}
