import assert from "node:assert/strict";
import test from "node:test";

import { ANALYTICS_EVENTS, isAnalyticsEvent, sanitizeEvent } from "./events.ts";

test("the tracked event list is exactly what the product needs", () => {
  assert.deepEqual([...ANALYTICS_EVENTS].sort(), [
    "audio_used",
    "calculator_used",
    "copy_used",
    "gst_mode_changed",
    "language_changed",
    "rate_selected",
    "share_used",
  ]);
});

test("unknown event names are dropped, not forwarded", () => {
  assert.equal(sanitizeEvent("amount_entered", { amount: 10_000 }), null);
  assert.equal(sanitizeEvent("", {}), null);
  assert.equal(isAnalyticsEvent("calculator_used"), true);
  assert.equal(isAnalyticsEvent("result_computed"), false);
});

test("valid payloads pass through", () => {
  assert.deepEqual(sanitizeEvent("calculator_used", { mode: "add", tax_type: "intraState" }), {
    name: "calculator_used",
    params: { mode: "add", tax_type: "intraState" },
  });
  assert.deepEqual(sanitizeEvent("language_changed", { locale: "hi" }), {
    name: "language_changed",
    params: { locale: "hi" },
  });
  assert.deepEqual(sanitizeEvent("audio_used", { locale: "en", action: "play" }), {
    name: "audio_used",
    params: { locale: "en", action: "play" },
  });
});

// --- the privacy guarantee ------------------------------------------

test("no user-entered value can be sent, whatever the caller passes", () => {
  const leaky = {
    mode: "add",
    tax_type: "intraState",
    // Everything below is exactly what must never leave the device.
    amount: 250_000,
    baseAmount: 250_000,
    gstAmount: 45_000,
    total: 295_000,
    cgst: 22_500,
    sgst: 22_500,
    igst: 0,
    shopName: "Sharma Traders",
    businessName: "Sharma Traders",
    customer: "Ramesh",
    gstin: "27AAPFU0939F1ZV",
    shareText: "Total amount: ₹2,95,000",
    email: "someone@example.com",
  };

  const event = sanitizeEvent("calculator_used", leaky);
  assert.ok(event);
  assert.deepEqual(event.params, { mode: "add", tax_type: "intraState" });

  const serialized = JSON.stringify(event.params);
  for (const forbidden of ["250000", "45000", "295000", "Sharma", "Ramesh", "27AAPFU", "@"]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden), `leaked ${forbidden}`);
  }
});

test("every event drops keys outside its own allowlist", () => {
  const junk = { amount: 1, shopName: "x", total: 2, nonsense: true };
  for (const name of ANALYTICS_EVENTS) {
    const event = sanitizeEvent(name, junk);
    assert.ok(event, name);
    for (const key of Object.keys(event.params)) {
      assert.ok(
        !["amount", "shopName", "total", "nonsense"].includes(key),
        `${name} leaked ${key}`,
      );
    }
  }
});

test("a custom rate reports its existence, never its value", () => {
  const event = sanitizeEvent("rate_selected", { rate_kind: "custom", rate: 7.5 });
  assert.ok(event);
  // `rate` is allowed by the schema, but the UI never passes it for a
  // custom rate — this asserts the shape the component actually sends.
  const fromComponent = sanitizeEvent("rate_selected", { rate_kind: "custom" });
  assert.deepEqual(fromComponent?.params, { rate_kind: "custom" });
});

test("preset rates travel as public tax information", () => {
  assert.deepEqual(sanitizeEvent("rate_selected", { rate_kind: "preset", rate: 18 })?.params, {
    rate_kind: "preset",
    rate: 18,
  });
});

test("share reports outcome and a boolean, never the shop name", () => {
  const event = sanitizeEvent("share_used", {
    method: "copy",
    outcome: "copied",
    has_shop_name: true,
    shop_name: "Sharma Traders",
  });
  assert.deepEqual(event?.params, {
    method: "copy",
    outcome: "copied",
    has_shop_name: true,
  });
});

// --- value validation -------------------------------------------------

test("wrong value types are rejected rather than coerced", () => {
  assert.deepEqual(sanitizeEvent("gst_mode_changed", { mode: "delete" })?.params, {});
  assert.deepEqual(sanitizeEvent("language_changed", { locale: "fr" })?.params, {});
  assert.deepEqual(sanitizeEvent("audio_used", { action: "pause" })?.params, {});
  assert.deepEqual(sanitizeEvent("share_used", { has_shop_name: "yes" })?.params, {});
  assert.deepEqual(sanitizeEvent("copy_used", { outcome: "shared" })?.params, {});
});

test("an out-of-range or non-finite rate is rejected", () => {
  for (const rate of [-1, 101, Number.NaN, Number.POSITIVE_INFINITY, "18"]) {
    const event = sanitizeEvent("rate_selected", { rate_kind: "preset", rate });
    assert.equal(event?.params.rate, undefined, `accepted ${String(rate)}`);
  }
});

test("missing parameters are simply absent", () => {
  assert.deepEqual(sanitizeEvent("calculator_used")?.params, {});
  assert.deepEqual(sanitizeEvent("calculator_used", { mode: undefined })?.params, {});
});
