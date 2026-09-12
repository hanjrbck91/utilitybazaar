import { gstCalculator } from "./gst-calculator.ts";
import { shell } from "./shell.ts";

/**
 * English dictionary — the source of truth for the translation shape.
 *
 * `Dictionary` is derived from this object, so every other locale must
 * provide exactly the same keys or TypeScript fails the build.
 *
 * Composed from the site shell (nav, About/Privacy/Terms, the language
 * switcher's own label) plus one module per tool — today just
 * `gst-calculator.ts`. Adding a tool means adding its own file and
 * spreading it in here; this file itself does not grow.
 *
 * Placeholders use `{name}` and are filled by `interpolate()`.
 * Never put numbers, currency or GST percentages in here — those are
 * formatted by the GST engine and stay identical across locales.
 */
export const en = {
  ...shell,
  ...gstCalculator,
  app: { ...shell.app, ...gstCalculator.app },
};
