/**
 * GST Calculator tool module — every string that belongs to this one
 * tool: its own header identity, inputs, results, errors, share/speech
 * text, SEO metadata, and its supporting content and FAQ.
 *
 * This is the pattern for every future tool: one file like this per
 * locale, merged into the site dictionary in `./index.ts`. Nothing here
 * is read by any other tool.
 */
export const gstCalculator = {
  app: {
    title: "GST Calculator",
    tagline: "Calculate GST in seconds.",
    calculatorLabel: "GST calculator",
  },

  calculator: {
    amount: "Amount",
    clearAmount: "Clear amount",
    mode: "Mode",
    add: "Add GST",
    addSub: "Exclusive",
    remove: "Remove GST",
    removeSub: "Inclusive",
    rate: "GST rate",
    custom: "Custom",
    customRateLabel: "Custom GST rate, percent",
    rateHint:
      "Select the rate that applies to your product or service. Other rates exist — use Custom.",
    taxType: "Type of supply",
    intraState: "Intra-State",
    interState: "Inter-State",
    treatmentIntra: "CGST + SGST / UTGST",
    treatmentInter: "IGST",
  },

  result: {
    label: "Result",
    total: "Total amount",
    base: "Amount before GST",
    empty: "Enter an amount above to see your GST.",
    summaryAdd: "Includes {gst} GST at {rate}%",
    summaryRemove: "{gst} of {total} is GST at {rate}%",
    viewBreakdown: "View breakdown",
    cgst: "CGST",
    sgst: "SGST",
    igst: "IGST",
    totalGst: "Total GST",
  },

  errors: {
    EMPTY: "Enter an amount.",
    NOT_A_NUMBER: "Enter a valid number.",
    NEGATIVE: "Amount cannot be negative.",
    ZERO: "Amount must be greater than zero.",
    TOO_SMALL: "Amount is too small.",
    TOO_LARGE: "Amount is too large.",
    RATE_NOT_A_NUMBER: "Enter a valid GST rate.",
    RATE_NEGATIVE: "GST rate cannot be negative.",
    RATE_TOO_LARGE: "GST rate is too high.",
  },

  actions: {
    listen: "Listen",
    stop: "Stop",
    speaking: "Reading the result aloud",
    listenUnavailable: "Read aloud is not available in this browser.",
    listenNoVoice:
      "Hindi read-aloud needs a Hindi voice, which is not available on this device or browser.",
    share: "Share",
    copied: "Copied!",
    copyFailed: "Could not copy. Select the result and copy it manually.",
    shareTitle: "GST calculation",
    addShopName: "Add shop name",
    hideShopName: "Hide shop name",
    shopNameHeading: "Shop / Business name",
    shopNamePlaceholder: "e.g. Sharma Traders",
    shopNameOptionalHint: "Optional. Added only to the shared text, never saved or sent.",
  },

  share: {
    heading: "GST calculation",
    modeAdd: "GST added",
    modeRemove: "GST removed",
    amount: "Amount",
    base: "Amount before GST",
    gst: "GST ({rate}%)",
    cgst: "CGST",
    sgst: "SGST",
    igst: "IGST",
    total: "Total amount",
  },

  speech: {
    /** "GST is 1,800 rupees." */
    gst: "GST is {gst} rupees.",
    cgst: "CGST is {cgst} rupees.",
    sgst: "SGST is {sgst} rupees.",
    igst: "IGST is {igst} rupees.",
    total: "Total amount is {total} rupees.",
    base: "Amount before GST is {base} rupees.",
  },

  seo: {
    title: "GST Calculator — Calculate GST Online",
    description:
      "Add GST to a price, or remove GST from a total that already includes it (reverse GST). See the CGST, SGST and IGST split instantly — a free, private GST calculator for India that works in your browser.",
    ogAlt: "GST Calculator for India",
  },

  content: {
    heading: "About GST calculations",

    howTitle: "How this calculator works",
    howBody:
      "Enter an amount, choose whether GST should be added or removed, pick the rate, and select whether the supply is within one state or between states. The result shows the amount before GST, the GST amount, the CGST and SGST or IGST split, and the total. Every calculation runs in your browser — nothing you enter is sent anywhere or saved.",

    exclusiveTitle: "GST-exclusive amounts — Add GST",
    exclusiveBody:
      "A GST-exclusive amount is the price before tax. GST is worked out as amount × rate ÷ 100, and the buyer pays the amount plus that GST. For example, ₹10,000 at 18% carries ₹1,800 of GST, so the invoice total is ₹11,800. Choose Add GST when you know your pre-tax price and need the figure to charge.",

    inclusiveTitle: "GST-inclusive amounts — Remove GST",
    inclusiveBody:
      "A GST-inclusive amount already contains the tax — a maximum retail price, or a payment you have received. To find the price before tax, the calculator divides by 1 + rate ÷ 100; the GST is whatever is left. For example, ₹11,800 at 18% comes from a base of ₹10,000, so ₹1,800 was GST. Choose Remove GST for this.",

    reverseTitle: "Reverse GST",
    reverseBody:
      "Taking GST back out of an inclusive amount is also called reverse GST. A common mistake is to subtract the rate percentage straight from the total: 18% of ₹11,800 is ₹2,124, which would leave ₹9,676 — but the real pre-tax amount is ₹10,000. GST was added to the smaller base, not to the total, so it has to be removed by division, not subtraction.",

    splitTitle: "CGST, SGST and IGST",
    splitBody:
      "The total GST is the same however it is charged; only who collects it changes. When the buyer and seller are in the same state or union territory, the GST is split equally — half as CGST for the central government and half as SGST (or UTGST) for the state. At 18% that is 9% plus 9%, so ₹1,800 becomes ₹900 and ₹900. When the sale crosses a state border, the whole amount is IGST instead.",

    ratesTitle: "GST rates in this calculator",
    ratesBody:
      "The quick-select rates are 5%, 18% and 40% — the main slabs in force since 22 September 2025, when the earlier 12% and 28% slabs were merged into 5% and 18% and a 40% rate was added for luxury and sin goods. Some goods are nil-rated (0%) or carry special rates such as 0.25% and 3%; enter any of these in the Custom field. This is general information, not tax advice — check the rate that officially applies to your goods or service.",

    privacyNote:
      "Everything is worked out in your browser — nothing you enter is sent to a server or saved.",
    privacyLinkText: "Read the privacy policy →",

    faqHeading: "Common questions",
    faq: [
      {
        q: "How do I remove GST from a price that already includes it?",
        a: "Choose Remove GST, enter the GST-inclusive amount and the rate that applied. The calculator divides the amount by 1 + rate ÷ 100 to get the price before tax, and the difference is the GST. Subtracting the rate percentage straight from the total gives the wrong answer.",
      },
      {
        q: "What is the difference between a GST-inclusive and a GST-exclusive price?",
        a: "A GST-exclusive price is the amount before tax — use Add GST to put GST on top. A GST-inclusive price already contains the tax, such as an MRP — use Remove GST to separate the base amount and the GST.",
      },
      {
        q: "How are CGST and SGST calculated from the GST amount?",
        a: "For a supply within one state or union territory, the GST amount is split in half: one half is CGST and the other is SGST (or UTGST). At an 18% rate that is 9% each. For a supply between states the whole amount is IGST instead, with no split.",
      },
      {
        q: "Are the 12% and 28% GST slabs still used?",
        a: "No. From 22 September 2025 the 12% and 28% slabs were merged into 5% and 18%, and a 40% rate was introduced for luxury and sin goods. A few items still carry special rates such as 0.25% and 3%, which you can enter in the Custom field.",
      },
      {
        q: "Which GST rate should I use?",
        a: "The rate that officially applies to your specific goods or service. This calculator cannot decide that for you — the quick-select options are the common rates, and any other rate can be typed into the Custom field. When it matters, check the current rate from an official source or a qualified professional.",
      },
    ],
  },
};
