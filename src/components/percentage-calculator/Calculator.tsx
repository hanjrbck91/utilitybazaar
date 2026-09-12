"use client";

import { useId, useState } from "react";
import {
  tryCalculatePercentage,
  validateNonZero,
  validateNumber,
  type PercentageMode,
  type PercentageResult,
  type ValidationResult,
} from "@/lib/percentage";
import { type PercentageDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { SegmentedControl } from "@/components/SegmentedControl";
import { InlineNumberField } from "./InlineNumberField";
import { ResultCard } from "./ResultCard";

export function Calculator() {
  const d = useDictionary<PercentageDictionary>();
  const errorId = useId();

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
  let checkA: ValidationResult;
  let checkB: ValidationResult;
  /** Raw input for whichever field `checkA`/`checkB` describe — used only to decide when to surface an error. */
  let rawA: string;
  let rawB: string;
  let lead: string | null;
  let mid: string;
  let tail: string;
  let sentence: React.ReactNode;

  if (mode === "of") {
    checkA = validateNumber(ofValues.percent);
    checkB = validateNumber(ofValues.number);
    rawA = ofValues.percent;
    rawB = ofValues.number;
    lead = d.calculator.ofLead;
    mid = d.calculator.ofMid;
    tail = d.calculator.ofTail;

    if (checkA.valid && checkB.valid) {
      const outcome = tryCalculatePercentage({
        mode: "of",
        percent: checkA.value,
        number: checkB.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    sentence = (
      <>
        {lead && <span>{lead}</span>}
        <InlineNumberField
          ariaLabel={d.calculator.percent}
          placeholder={d.calculator.percentPlaceholder}
          value={ofValues.percent}
          onChange={(percent) => setOfValues((prev) => ({ ...prev, percent }))}
          onClear={() => setOfValues((prev) => ({ ...prev, percent: "" }))}
          hasError={!checkA.valid && ofValues.percent !== ""}
          describedBy={errorId}
        />
        <span>{mid}</span>
        <InlineNumberField
          ariaLabel={d.calculator.ofNumber}
          placeholder={d.calculator.ofNumberPlaceholder}
          value={ofValues.number}
          onChange={(number) => setOfValues((prev) => ({ ...prev, number }))}
          onClear={() => setOfValues((prev) => ({ ...prev, number: "" }))}
          hasError={!checkB.valid && ofValues.number !== ""}
          describedBy={errorId}
        />
        <span>{tail}</span>
      </>
    );
  } else if (mode === "isPercent") {
    checkA = validateNumber(isPercentValues.part);
    checkB = validateNonZero(isPercentValues.whole);
    rawA = isPercentValues.part;
    rawB = isPercentValues.whole;
    lead = null;
    mid = d.calculator.isPercentMid;
    tail = d.calculator.isPercentTail;

    if (checkA.valid && checkB.valid) {
      const outcome = tryCalculatePercentage({
        mode: "isPercent",
        part: checkA.value,
        whole: checkB.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    sentence = (
      <>
        <InlineNumberField
          ariaLabel={d.calculator.part}
          placeholder={d.calculator.partPlaceholder}
          value={isPercentValues.part}
          onChange={(part) => setIsPercentValues((prev) => ({ ...prev, part }))}
          onClear={() => setIsPercentValues((prev) => ({ ...prev, part: "" }))}
          hasError={!checkA.valid && isPercentValues.part !== ""}
          describedBy={errorId}
        />
        <span>{mid}</span>
        <InlineNumberField
          ariaLabel={d.calculator.whole}
          placeholder={d.calculator.wholePlaceholder}
          value={isPercentValues.whole}
          onChange={(whole) => setIsPercentValues((prev) => ({ ...prev, whole }))}
          onClear={() => setIsPercentValues((prev) => ({ ...prev, whole: "" }))}
          hasError={!checkB.valid && isPercentValues.whole !== ""}
          describedBy={errorId}
        />
        <span>{tail}</span>
      </>
    );
  } else {
    checkA = validateNonZero(changeValues.from);
    checkB = validateNumber(changeValues.to);
    rawA = changeValues.from;
    rawB = changeValues.to;
    lead = d.calculator.changeLead;
    mid = d.calculator.changeMid;
    tail = d.calculator.changeTail;

    if (checkA.valid && checkB.valid) {
      const outcome = tryCalculatePercentage({
        mode: "change",
        from: checkA.value,
        to: checkB.value,
      });
      result = outcome.ok ? outcome.data : null;
    }

    sentence = (
      <>
        {lead && <span>{lead}</span>}
        <InlineNumberField
          ariaLabel={d.calculator.from}
          placeholder={d.calculator.fromPlaceholder}
          value={changeValues.from}
          onChange={(from) => setChangeValues((prev) => ({ ...prev, from }))}
          onClear={() => setChangeValues((prev) => ({ ...prev, from: "" }))}
          hasError={!checkA.valid && changeValues.from !== ""}
          describedBy={errorId}
        />
        <span>{mid}</span>
        <InlineNumberField
          ariaLabel={d.calculator.to}
          placeholder={d.calculator.toPlaceholder}
          value={changeValues.to}
          onChange={(to) => setChangeValues((prev) => ({ ...prev, to }))}
          onClear={() => setChangeValues((prev) => ({ ...prev, to: "" }))}
          hasError={!checkB.valid && changeValues.to !== ""}
          describedBy={errorId}
        />
        <span>{tail}</span>
      </>
    );
  }

  // Only one error shows at a time — whichever field the reader is most
  // likely mid-typing in, left to right.
  const activeError = !checkA.valid && rawA !== ""
    ? d.errors[checkA.code]
    : !checkB.valid && rawB !== ""
      ? d.errors[checkB.code]
      : null;

  return (
    <section
      aria-label={d.app.calculatorLabel}
      // Wider than GST's card at sm+: the "change" sentence ("What is the
      // % change from [ ] to [ ]?") needs the extra room to stay on one
      // line instead of wrapping mid-sentence. Matches the page's own
      // responsive growth, so it never exceeds the space already there.
      className="mx-auto w-full max-w-[464px] rounded-card border border-line bg-surface p-5 shadow-card sm:max-w-xl sm:p-6 lg:max-w-2xl"
    >
      <div className="space-y-5">
        <SegmentedControl<PercentageMode>
          legend={d.calculator.mode}
          name="percentage-mode"
          options={modeOptions}
          value={mode}
          onChange={setMode}
        />

        <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5 text-base font-medium leading-relaxed text-text sm:text-lg">
          {sentence}
        </div>

        <p
          id={errorId}
          role={activeError ? "alert" : undefined}
          className="min-h-5 px-0.5 text-xs text-danger motion-safe:transition-opacity"
        >
          {activeError}
        </p>
      </div>

      <div className="mt-5">
        <ResultCard result={result} />
      </div>
    </section>
  );
}
