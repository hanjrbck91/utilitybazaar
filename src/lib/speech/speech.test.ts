import assert from "node:assert/strict";
import test from "node:test";

import {
  hasVoiceForLocale,
  pickVoice,
  voiceAvailability,
  type VoiceLike,
} from "./voice.ts";

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

// --- Indian-language voice selection, requirement by requirement -----

test("English: exact en-IN voice is selected", () => {
  const v = pickVoice([voice("en-IN", "Ravi")], "en");
  assert.equal(v?.name, "Ravi");
  assert.equal(v?.lang, "en-IN");
});

test("English: en-IN is preferred over en-US and en-GB", () => {
  const withIndian = [
    voice("en-US", "David"),
    voice("en-GB", "George"),
    voice("en-IN", "Ravi"),
  ];
  assert.equal(pickVoice(withIndian, "en")?.name, "Ravi");
  // order in the list must not matter
  assert.equal(
    pickVoice([voice("en-IN", "Heera"), voice("en-US", "Zira")], "en")?.name,
    "Heera",
  );
});

test("English: another English voice is used only when no en-IN exists", () => {
  assert.equal(pickVoice([voice("en-US", "David"), voice("en-GB", "George")], "en")?.name, "David");
});

test("English: never selects a non-English voice", () => {
  assert.equal(pickVoice([voice("hi-IN"), voice("fr-FR"), voice("de-DE")], "en"), null);
});

test("Hindi: exact hi-IN voice is selected", () => {
  const v = pickVoice([voice("hi-IN", "Lekha")], "hi");
  assert.equal(v?.name, "Lekha");
  assert.equal(v?.lang, "hi-IN");
});

test("Hindi: hi-IN is preferred over other Hindi voices", () => {
  const voices = [voice("hi", "Generic Hindi"), voice("hi-IN", "Swara")];
  assert.equal(pickVoice(voices, "hi")?.name, "Swara");
});

test("Hindi: falls back to any hi-* voice when there is no hi-IN", () => {
  assert.equal(pickVoice([voice("hi", "Generic Hindi")], "hi")?.name, "Generic Hindi");
  assert.equal(pickVoice([voice("hi-Latn", "Romanised")], "hi")?.name, "Romanised");
});

test("Hindi: no Hindi voice means no voice — English is never substituted", () => {
  for (const englishOnly of [
    [voice("en-IN", "Ravi")],
    [voice("en-US"), voice("en-GB")],
    [voice("en-IN"), voice("en-US"), voice("ta-IN"), voice("bn-IN")],
  ]) {
    assert.equal(pickVoice(englishOnly, "hi"), null, JSON.stringify(englishOnly));
    assert.equal(hasVoiceForLocale(englishOnly, "hi"), false);
    assert.equal(voiceAvailability(englishOnly, "hi", true), "missing");
  }
});

test("Hindi: an installed hi-IN voice makes the locale available", () => {
  const voices = [voice("en-IN", "Ravi"), voice("hi-IN", "Swara")];
  assert.equal(hasVoiceForLocale(voices, "hi"), true);
  assert.equal(voiceAvailability(voices, "hi", true), "ready");
  // and English still resolves to its own Indian voice, unaffected
  assert.equal(pickVoice(voices, "en")?.name, "Ravi");
});
