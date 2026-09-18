/**
 * Site shell — strings that belong to UtilityBazaar itself, not to any
 * one tool: the language switcher's own label, the site-wide nav, and
 * the About/Privacy/Terms pages every tool shares.
 *
 * Every tool module (see `./gst-calculator.ts`) is merged on top of this
 * in `./index.ts`. When a second tool is added, it gets its own file
 * next to this one — this file does not grow with the tool count.
 */
export const shell = {
  localeName: "English",

  app: {
    languageLabel: "Language",
  },

  nav: {
    siteLinks: "Site",
    calculator: "Calculator",
    backToCalculator: "Back to the calculator",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
    gstCalculator: "GST Calculator",
    percentageCalculator: "Percentage Calculator",
    otherCalculators: "Other calculators",
  },

  copy: {
    label: "Copy result",
    copied: "Copied!",
    failed: "Couldn't copy",
  },

  about: {
    title: "About",
    description: "What UtilityBazaar is, and the tools it currently offers.",
    body: [
      "UtilityBazaar is a small collection of simple, practical online tools — everyday calculations made fast, without needing an account or a spreadsheet.",
      "It currently includes a GST Calculator, for adding, removing and splitting GST on an amount, and a Percentage Calculator, for percentages, shares and the change between two numbers. Both work the same way: enter a value, get an instant, clear result.",
      "Every tool runs entirely in your browser — nothing you type is sent anywhere. More tools may be added over time, each built to do one job well.",
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
