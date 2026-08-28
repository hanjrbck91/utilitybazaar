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
    listenUnavailable: "Read aloud is not available in this browser",
    listenNoVoice: "Your browser does not have a Hindi voice installed",
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
      "Add GST to a price or remove GST from a GST-inclusive amount, and see the CGST, SGST and IGST split instantly. A free, private GST calculator for India that works in your browser.",
    ogAlt: "GST Calculator for India",
  },

  content: {
    heading: "About GST calculations",
    whatIsGstTitle: "What is GST?",
    whatIsGstBody:
      "Goods and Services Tax is the indirect tax charged on most goods and services sold in India. It is added to the price of what you sell, collected from the customer, and paid to the government. The rate depends on what is being sold.",
    addTitle: "How to add GST",
    addBody:
      "Start from the price before tax, then add the GST on top. At 18%, a base price of ₹10,000 carries ₹1,800 of GST, so the customer pays ₹11,800. Choose Add GST when you know your price and need the amount to charge.",
    removeTitle: "How to remove GST",
    removeBody:
      "Removing GST works backwards from a price that already includes it — an MRP, for example, or an amount you have received. Divide by 1 plus the rate: ₹11,800 at 18% comes from a base of ₹10,000, so ₹1,800 was tax. Choose Remove GST for this.",
    splitTitle: "CGST, SGST and IGST",
    splitBody:
      "The total GST is the same either way; only the split changes. When buyer and seller are in the same state, it is divided equally into CGST for the centre and SGST for the state. When the sale crosses a state border, the whole amount is IGST instead.",
  },

  nav: {
    siteLinks: "Site",
    calculator: "Calculator",
    backToCalculator: "Back to the calculator",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
  },

  about: {
    title: "About",
    description: "What this GST calculator is, and what it is not.",
    body: [
      "This is a small, fast GST calculator for India. Enter an amount, choose whether you are adding or removing GST, pick the rate that applies, and read the result — including the CGST, SGST or IGST split.",
      "Every calculation runs in your browser. Nothing you type is sent anywhere, and there is no account to create.",
      "The suggested rates are shortcuts, not a ruling on what applies to your goods or service. Any rate can be entered manually.",
    ],
  },

  privacy: {
    title: "Privacy",
    description: "What this site does and does not collect.",
    body: [
      "Calculations happen entirely in your browser. Amounts, results and any shop name you enter are never sent to a server, never stored on one, and never shared.",
      "Read-aloud uses your browser's built-in speech engine. Sharing uses your device's share sheet or clipboard. Neither sends the calculation to us.",
      "If analytics is enabled on this deployment, it records anonymous interaction events — that a calculation happened, a language was switched, a result was shared — and never the values involved.",
      "If advertising is enabled on this deployment, the ad provider may set cookies or use similar technologies, subject to its own policy.",
      "No cookies are set by the calculator itself.",
    ],
  },

  terms: {
    title: "Terms",
    description: "The basis on which this calculator is provided.",
    body: [
      "This calculator is provided for general informational purposes and for convenience in everyday calculations.",
      "You are responsible for choosing the GST rate that applies to your goods or service. The suggested rates in the interface are shortcuts, not a determination of what is correct for your case.",
      "Nothing here is tax, legal or accounting advice. For a decision that matters, check the current official rate and speak to a qualified professional.",
      "The calculator is provided as is, without warranty. Verify any figure before relying on it.",
    ],
  },
};
