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

  const clear = () => {
    setRawAmount("");
    setCustomRate("");
  };

  const modeOptions = [
    { value: "add" as const, label: d.calculator.add },
    { value: "remove" as const, label: d.calculator.remove },
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
          onChange={setMode}
        />

        <RateSelector
          presets={PRESETS}
          selection={rateSelection}
          customValue={customRate}
          onSelectPreset={setRateSelection}
          onSelectCustom={() => setRateSelection("custom")}
          onCustomValueChange={setCustomRate}
          error={rateCheck.valid ? null : d.errors[rateCheck.code]}
        />

        <SegmentedControl<TaxType>
          legend={d.calculator.taxType}
          name="tax-type"
          options={taxTypeOptions}
          value={taxType}
          onChange={setTaxType}
        />
      </div>

      <div className="mt-6">
        <ResultCard breakdown={breakdown} />
        {/* Always mounted — see ResultActions for why it fades rather than
            unmounting when there is no result. */}
        <div className="pt-3">
          <ResultActions breakdown={breakdown} />
        </div>
      </div>
    </section>
  );
}
