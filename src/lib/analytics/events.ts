/**
 * Analytics event contract.
 *
 * The rule this file exists to enforce: **no value the user typed, and
 * no value the calculator produced, may ever be sent.** Not the amount,
 * not the GST, not the total, not the shop name.
 *
 * That is enforced structurally rather than by discipline — every event
 * has an explicit allowlist of parameter keys and permitted value
 * shapes, and `sanitizeEvent` drops anything else. A future caller that
 * passes `{ amount }` by mistake sends nothing extra.
 *
 * GST rates are the one number that travels, and only for the preset
 * chips: a rate is public tax information, identical for every user, and
 * knowing which presets get used tells us which to offer. A *custom*
 * rate is reported as its existence only, never its value.
 */

export type AnalyticsEventName =
  | "calculator_used"
  | "gst_mode_changed"
  | "rate_selected"
  | "language_changed"
  | "audio_used"
  | "share_used"
  | "copy_used";

export type AnalyticsValue = string | number | boolean;
export type AnalyticsParams = Record<string, AnalyticsValue>;

type Validator = (value: unknown) => boolean;

const isMode: Validator = (v) => v === "add" || v === "remove";
const isTaxType: Validator = (v) => v === "intraState" || v === "interState";
const isLocale: Validator = (v) => v === "en" || v === "hi";
const isBoolean: Validator = (v) => typeof v === "boolean";

/** A finite, non-negative rate — never an amount, never a result. */
const isRate: Validator = (v) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

const oneOf =
  (...allowed: string[]): Validator =>
  (v) =>
    typeof v === "string" && allowed.includes(v);

/**
 * Allowed parameters per event. A key absent from this table cannot be
 * sent, whatever a caller passes.
 */
const SCHEMA: Record<AnalyticsEventName, Record<string, Validator>> = {
  calculator_used: { mode: isMode, tax_type: isTaxType },
  gst_mode_changed: { mode: isMode },
  rate_selected: { rate_kind: oneOf("preset", "custom"), rate: isRate },
  language_changed: { locale: isLocale },
  audio_used: { locale: isLocale, action: oneOf("play", "stop") },
  share_used: {
    method: oneOf("native", "copy"),
    outcome: oneOf("shared", "copied", "dismissed", "failed"),
    has_shop_name: isBoolean,
  },
  copy_used: { outcome: oneOf("copied", "failed") },
};

export const ANALYTICS_EVENTS = Object.keys(SCHEMA) as AnalyticsEventName[];

export function isAnalyticsEvent(name: string): name is AnalyticsEventName {
  return name in SCHEMA;
}

export interface SanitizedEvent {
  name: AnalyticsEventName;
  params: AnalyticsParams;
}

/**
 * Reduce an event to what is allowed to leave the device.
 *
 * Returns `null` for an unknown event name, so a typo is dropped rather
 * than sent as an unrecognised event.
 */
export function sanitizeEvent(
  name: string,
  params: Record<string, unknown> = {},
): SanitizedEvent | null {
  if (!isAnalyticsEvent(name)) return null;

  const allowed = SCHEMA[name];
  const clean: AnalyticsParams = {};

  for (const [key, validate] of Object.entries(allowed)) {
    const value = params[key];
    if (value === undefined) continue;
    if (validate(value)) clean[key] = value as AnalyticsValue;
  }

  return { name, params: clean };
}
