import type { Dictionary, HomeDictionary, PercentageDictionary } from "../../lib/i18n/types.ts";
import { gstCalculator } from "./gst-calculator.ts";
import { home } from "./home.ts";
import { percentageCalculator } from "./percentage-calculator.ts";
import { shell } from "./shell.ts";

/**
 * Hindi dictionary.
 *
 * Written as an Indian shopkeeper or customer would actually say it, not
 * as a literal rendering of the English. "GST", "CGST", "SGST" and "IGST"
 * stay in Latin script because that is how they appear on every invoice
 * and how people say them out loud.
 *
 * Composed the same way as `../en/index.ts` — shell plus one module per
 * tool. Typed as `Dictionary`, so a missing or misspelled key fails the
 * build.
 */
export const hi: Dictionary = {
  ...shell,
  ...gstCalculator,
  app: { ...shell.app, ...gstCalculator.app },
};

/** The Percentage Calculator's own Hindi dictionary — see `enPercentage`. */
export const hiPercentage: PercentageDictionary = {
  ...shell,
  ...percentageCalculator,
  app: { ...shell.app, ...percentageCalculator.app },
};

/** The homepage's own Hindi dictionary — see `enHome`. */
export const hiHome: HomeDictionary = {
  ...shell,
  ...home,
  app: { ...shell.app, ...home.app },
};
