import assert from "node:assert/strict";
import test from "node:test";

import { calculateGst, type GstInput } from "../gst/index.ts";
import { getDictionary } from "../i18n/index.ts";
import { buildSpeechText } from "./script.ts";
import { pickVoice, voiceAvailability, type VoiceLike } from "./voice.ts";

const en = getDictionary("en");
const hi = getDictionary("hi");

const breakdown = (input: GstInput) => calculateGst(input);

const ADD_INTRA: GstInput = {
  amount: 10_000,
  mode: "add",
  gstRate: 18,
  taxType: "intraState",
};

test("Add GST, intra-state — English", () => {
  const text = buildSpeechText(breakdown(ADD_INTRA), en);
  assert.equal(
    text,
    "GST is 1,800 rupees. CGST is 900 rupees. SGST is 900 rupees. Total amount is 11,800 rupees.",
  );
});

test("Add GST, intra-state — Hindi", () => {
  const text = buildSpeechText(breakdown(ADD_INTRA), hi);
  assert.equal(
    text,
    "GST 1,800 रुपये है। CGST 900 रुपये है। SGST 900 रुपये है। कुल राशि 11,800 रुपये है।",
  );
});

test("Remove GST speaks the amount before GST instead of the total", () => {
  const text = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" }),
    en,
  );
  assert.match(text, /Amount before GST is 10,000 rupees\.$/);
  assert.doesNotMatch(text, /Total amount/);

  const hindi = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" }),
    hi,
  );
  assert.match(hindi, /GST से पहले की राशि 10,000 रुपये है।$/);
});

test("inter-state speaks IGST once, not GST twice", () => {
  const text = buildSpeechText(
    breakdown({ amount: 10_000, mode: "add", gstRate: 18, taxType: "interState" }),
    en,
  );
  assert.equal(text, "IGST is 1,800 rupees. Total amount is 11,800 rupees.");
  assert.doesNotMatch(text, /CGST|SGST/);
});

test("spoken amounts carry no currency symbol but keep Indian grouping", () => {
  const text = buildSpeechText(
    breakdown({ amount: 1_00_000, mode: "add", gstRate: 18, taxType: "interState" }),
    en,
  );
  assert.doesNotMatch(text, /₹/);
  assert.match(text, /1,18,000 rupees/);
});

test("decimal results are spoken to the paise", () => {
  const text = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 1.5, taxType: "interState" }),
    en,
  );
  assert.match(text, /IGST is 174\.38 rupees/);
  assert.match(text, /11,625\.62 rupees/);
});

// --- voice selection -------------------------------------------------

const voice = (lang: string, name = lang): VoiceLike => ({ lang, name });

test("pickVoice prefers an exact region match", () => {
  const voices = [voice("hi-IN", "Lekha"), voice("hi-Latn"), voice("en-US")];
  assert.equal(pickVoice(voices, "hi")?.name, "Lekha");
  assert.equal(pickVoice([voice("en-GB"), voice("en-IN", "Rishi")], "en")?.name, "Rishi");
});

test("pickVoice accepts any voice of the same language", () => {
  assert.equal(pickVoice([voice("hi-Latn", "Generic")], "hi")?.name, "Generic");
  assert.equal(pickVoice([voice("en-US", "Samantha")], "en")?.name, "Samantha");
});

test("pickVoice tolerates underscore and case variations", () => {
  assert.ok(pickVoice([voice("HI_in", "Odd")], "hi"));
});

test("pickVoice never substitutes another language", () => {
  const englishOnly = [voice("en-US"), voice("en-GB"), voice("fr-FR")];
  assert.equal(pickVoice(englishOnly, "hi"), null);
});

test("voiceAvailability: Hindi missing when voices are loaded and none match", () => {
  const englishOnly = [voice("en-US"), voice("en-GB")];
  assert.equal(voiceAvailability(englishOnly, "hi", true), "missing");
  assert.equal(voiceAvailability(englishOnly, "en", true), "ready");
});

test("voiceAvailability stays optimistic while the voice list is still loading", () => {
  // speechSynthesis.getVoices() is empty until the engine populates it —
  // that is not the same as "this locale has no voice".
  assert.equal(voiceAvailability([], "hi", false), "unknown");
  assert.equal(voiceAvailability([], "en", false), "unknown");
  assert.equal(voiceAvailability([], "hi", true), "unknown");
});

test("voiceAvailability reports ready as soon as a match exists", () => {
  assert.equal(voiceAvailability([voice("hi-IN")], "hi", false), "ready");
});
