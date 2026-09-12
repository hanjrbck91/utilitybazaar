import assert from "node:assert/strict";
import test from "node:test";

import { enPercentage } from "../../translations/en/index.ts";
import { hiPercentage } from "../../translations/hi/index.ts";

/**
 * Same translation-key-parity contract as `../i18n/i18n.test.ts`, applied
 * to the Percentage Calculator's own dictionary. Duplicated rather than
 * imported: the two tools' dictionaries are deliberately never merged
 * or compared against each other, only each against its own English
 * source.
 */

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function at(value: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], value);
}

test("Percentage Calculator: every locale has exactly the same keys", () => {
  const enPaths = paths(enPercentage).sort();
  const hiPaths = paths(hiPercentage).sort();
  assert.deepEqual(hiPaths, enPaths);
});

test("Percentage Calculator: no translated string is empty or left in English by accident", () => {
  for (const path of paths(enPercentage)) {
    const enValue = at(enPercentage, path) as string;
    const hiValue = at(hiPercentage, path) as string;
    assert.equal(typeof hiValue, "string", `${path} must be a string`);
    assert.ok(hiValue.trim().length > 0, `${path} is empty in hi`);
    assert.notEqual(hiValue, enValue, `${path} is untranslated in hi`);
  }
});

test("Percentage Calculator: placeholders match between locales", () => {
  const placeholders = (s: string) =>
    [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  for (const path of paths(enPercentage)) {
    assert.deepEqual(
      placeholders(at(hiPercentage, path) as string),
      placeholders(at(enPercentage, path) as string),
      `placeholders differ at ${path}`,
    );
  }
});
