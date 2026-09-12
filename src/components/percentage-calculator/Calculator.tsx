"use client";

import { useState } from "react";
import {
  tryCalculatePercentage,
  validateNonZero,
  validateNumber,
  type PercentageMode,
  type PercentageResult,
} from "@/lib/percentage";
import { type PercentageDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { SegmentedControl } from "@/components/SegmentedControl";
import { NumberField } from "./NumberField";
import { ResultCard } from "./ResultCard";

export function Calculator() {
  const d = useDictionary<PercentageDictionary>();

  const [mode, setMode] = useState<PercentageMode>("of");

  // One raw string pair per mode, kept independent so switching modes
  // never loses or leaks a value into an unrelated pair of fields.
  const [ofValues, setOfValues] = useState({ percent: "", number: "" });
  const [isPercentValues, setIsPercentValues] = useState({ part: "", whole: "" });
  const [changeValues, setChangeValues] = useState({ from: "", to: "" });

  const modeOptions = [
    { value: "of" as const, label: d.calculator.modeOf },
    { value: "isPercent" as const, label: d.calculator.modeIsPercent },
    { value: "change" as const, label: d.calculator.modeChange },
  ];

  let result: PercentageResult | null = null;
  let fields: React.ReactNode;

  if (mode === "of") {
    const percentCheck = validateNumber(ofValues.percent);
    const numberCheck = validateNumber(ofValues.number);
    if (percentCheck.valid && numberCheck.valid) {
      const outcome = tryCalculatePercentage({
        mode: "of",
        percent: percentCheck.value,
        number: numberCheck.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    fields = (
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={d.calculator.percent}
          clearLabel={`${d.calculator.clear} ${d.calculator.percent}`}
          value={ofValues.percent}
          onChange={(percent) => setOfValues((prev) => ({ ...prev, percent }))}
          onClear={() => setOfValues((prev) => ({ ...prev, percent: "" }))}
          error={percentCheck.valid ? null : d.errors[percentCheck.code]}
        />
        <NumberField
          label={d.calculator.ofNumber}
          clearLabel={`${d.calculator.clear} ${d.calculator.ofNumber}`}
          value={ofValues.number}
          onChange={(number) => setOfValues((prev) => ({ ...prev, number }))}
          onClear={() => setOfValues((prev) => ({ ...prev, number: "" }))}
          error={numberCheck.valid ? null : d.errors[numberCheck.code]}
        />
      </div>
    );
  } else if (mode === "isPercent") {
    const partCheck = validateNumber(isPercentValues.part);
    const wholeCheck = validateNonZero(isPercentValues.whole);
    if (partCheck.valid && wholeCheck.valid) {
      const outcome = tryCalculatePercentage({
        mode: "isPercent",
        part: partCheck.value,
        whole: wholeCheck.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    fields = (
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={d.calculator.part}
          clearLabel={`${d.calculator.clear} ${d.calculator.part}`}
          value={isPercentValues.part}
          onChange={(part) => setIsPercentValues((prev) => ({ ...prev, part }))}
          onClear={() => setIsPercentValues((prev) => ({ ...prev, part: "" }))}
          error={partCheck.valid ? null : d.errors[partCheck.code]}
        />
        <NumberField
          label={d.calculator.whole}
          clearLabel={`${d.calculator.clear} ${d.calculator.whole}`}
          value={isPercentValues.whole}
          onChange={(whole) => setIsPercentValues((prev) => ({ ...prev, whole }))}
          onClear={() => setIsPercentValues((prev) => ({ ...prev, whole: "" }))}
          error={wholeCheck.valid ? null : d.errors[wholeCheck.code]}
        />
      </div>
    );
  } else {
    const fromCheck = validateNonZero(changeValues.from);
    const toCheck = validateNumber(changeValues.to);
    if (fromCheck.valid && toCheck.valid) {
      const outcome = tryCalculatePercentage({
        mode: "change",
        from: fromCheck.value,
        to: toCheck.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    fields = (
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={d.calculator.from}
          clearLabel={`${d.calculator.clear} ${d.calculator.from}`}
          value={changeValues.from}
          onChange={(from) => setChangeValues((prev) => ({ ...prev, from }))}
          onClear={() => setChangeValues((prev) => ({ ...prev, from: "" }))}
          error={fromCheck.valid ? null : d.errors[fromCheck.code]}
        />
        <NumberField
          label={d.calculator.to}
          clearLabel={`${d.calculator.clear} ${d.calculator.to}`}
          value={changeValues.to}
          onChange={(to) => setChangeValues((prev) => ({ ...prev, to }))}
          onClear={() => setChangeValues((prev) => ({ ...prev, to: "" }))}
          error={toCheck.valid ? null : d.errors[toCheck.code]}
        />
      </div>
    );
  }

  return (
    <section
      aria-label={d.app.calculatorLabel}
      className="mx-auto w-full max-w-[464px] rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="space-y-5">
        <SegmentedControl<PercentageMode>
          legend={d.calculator.mode}
          name="percentage-mode"
          options={modeOptions}
          value={mode}
          onChange={setMode}
        />

        {fields}
      </div>

      <div className="mt-5">
        <ResultCard result={result} />
      </div>
    </section>
  );
}
