/**
 * Percentage Calculator tool module — every string that belongs to this
 * one tool, following the same shape as `./gst-calculator.ts`. Merged
 * into its own site dictionary in `./index.ts`, never into GST's.
 */
export const percentageCalculator = {
  app: {
    title: "Percentage Calculator",
    tagline: "Calculate percentages in seconds.",
    calculatorLabel: "Percentage calculator",
  },

  calculator: {
    mode: "Calculate",
    modeOf: "What is X% of Y?",
    modeIsPercent: "What % is X of Y?",
    modeChange: "What is the % change?",

    percent: "Percentage",
    ofNumber: "Of number",
    part: "Value",
    whole: "Out of",
    from: "Starting value",
    to: "New value",

    percentPlaceholder: "e.g. 12",
    ofNumberPlaceholder: "e.g. 100",
    partPlaceholder: "e.g. 18",
    wholePlaceholder: "e.g. 100",
    fromPlaceholder: "e.g. 100",
    toPlaceholder: "e.g. 120",

    clear: "Clear",
  },

  result: {
    label: "Result",
    empty: "Enter values above to see the result.",
    contextOf: "{percent}% of {number}",
    contextIsPercent: "{part} of {whole}",
    contextChange: "{from} to {to}",
    increase: "Increase",
    decrease: "Decrease",
    noChange: "No change",
    difference: "Difference",
  },

  errors: {
    EMPTY: "Enter a number.",
    NOT_A_NUMBER: "Enter a valid number.",
    TOO_LARGE: "That number is too large.",
    ZERO_BASE: "This value cannot be zero.",
  },

  seo: {
    title: "Percentage Calculator — Calculate Percentages Online",
    description:
      "Find a percentage of a number, work out what percentage one number is of another, or calculate a percentage increase or decrease — a free, private percentage calculator that works instantly in your browser.",
    ogAlt: "Percentage Calculator",
  },

  content: {
    heading: "About percentage calculations",
    otherCalculatorsHeading: "Other calculators",

    whatTitle: "What is a percentage?",
    whatBody:
      "A percentage is a way of expressing a number as a fraction of 100 — \"18%\" means 18 out of every 100. It is a ratio, so it always compares one amount against another, whether that other amount is a total, a starting value, or the number 100 itself.",

    ofTitle: "Percentage of a number",
    ofBody:
      "To find a percentage of a number, multiply the number by the percentage and divide by 100. For example, 18% of 10,000 is 10,000 × 18 ÷ 100 = 1,800. Use this when you already know the rate and need the amount it represents — a discount, a tip, or a share of a total.",

    isPercentTitle: "What percentage is one number of another?",
    isPercentBody:
      "To find what percentage a value is of a total, divide the value by the total and multiply by 100. For example, 18 is what percentage of 100? 18 ÷ 100 × 100 = 18%. This answers questions like \"what share of the whole is this part?\"",

    increaseTitle: "Percentage increase",
    increaseBody:
      "A percentage increase compares a rise from one value to a larger one. Subtract the starting value from the new value, divide by the starting value, and multiply by 100. Going from 100 to 120 is a rise of 20, and 20 ÷ 100 × 100 = 20% increase.",

    decreaseTitle: "Percentage decrease",
    decreaseBody:
      "A percentage decrease works the same way, in reverse: subtract the new, smaller value from the starting value, divide by the starting value, and multiply by 100. Going from 100 to 80 is a fall of 20, and 20 ÷ 100 × 100 = 20% decrease.",

    privacyNote:
      "Everything is worked out in your browser — nothing you enter is sent to a server or saved.",
    privacyLinkText: "Read the privacy policy →",

    faqHeading: "Common questions",
    faq: [
      {
        q: "How do I calculate a percentage of a number?",
        a: "Multiply the number by the percentage, then divide by 100. For example, 18% of 10,000 is (10,000 × 18) ÷ 100 = 1,800.",
      },
      {
        q: "How do I find out what percentage one number is of another?",
        a: "Divide the smaller number by the larger one, then multiply by 100. For example, 18 is what percentage of 100? (18 ÷ 100) × 100 = 18%.",
      },
      {
        q: "How is a percentage increase calculated?",
        a: "Subtract the original value from the new value, divide the result by the original value, then multiply by 100. Going from 100 to 120 is a 20% increase, because (120 − 100) ÷ 100 × 100 = 20.",
      },
      {
        q: "How is a percentage decrease calculated?",
        a: "Subtract the new, smaller value from the original value, divide by the original value, then multiply by 100. Going from 100 to 80 is a 20% decrease, because (100 − 80) ÷ 100 × 100 = 20.",
      },
      {
        q: "Why can't the starting value be zero in a percentage change?",
        a: "A percentage change is measured relative to the starting value, so the calculation divides by it. Dividing by zero has no defined answer, so a starting value of zero cannot produce a percentage change.",
      },
    ],
  },
};
