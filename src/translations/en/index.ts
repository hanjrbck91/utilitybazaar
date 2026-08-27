/**
 * English dictionary — the source of truth for the translation shape.
 *
 * `Dictionary` is derived from this object, so every other locale must
 * provide exactly the same keys or TypeScript fails the build.
 *
 * Placeholders use `{name}` and are filled by `interpolate()`.
 * Never put numbers, currency or GST percentages in here — those are
 * formatted by the GST engine and stay identical across locales.
 */
export const en = {
  /** Shown in the language switcher. Always written in its own language. */
  localeName: "English",

  app: {
    title: "GST Calculator",
    tagline: "Calculate GST in seconds.",
    calculatorLabel: "GST calculator",
    languageLabel: "Language",
  },

  calculator: {
    amount: "Amount",
    clearAmount: "Clear amount",
    mode: "Mode",
    add: "Add GST",
    remove: "Remove GST",
    rate: "GST rate",
    custom: "Custom",
    customRateLabel: "Custom GST rate, percent",
    rateHint:
      "Suggested rates are indicative. Confirm the rate that applies to your goods or service.",
    taxType: "Tax type",
    intraState: "Within state",
    interState: "Other state",
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
    listenUnavailable: "Read aloud is not available in this browser",
    listenNoVoice: "Your browser does not have a Hindi voice installed",
    share: "Share",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy. Select the result and copy it manually.",
    shareTitle: "GST calculation",
    addShopName: "Add shop name",
    hideShopName: "Hide shop name",
    shopNameLabel: "Shop or business name, optional",
    shopNamePlaceholder: "Shop name (optional)",
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
};
