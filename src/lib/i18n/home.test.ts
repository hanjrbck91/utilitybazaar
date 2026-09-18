import assert from "node:assert/strict";
import test from "node:test";

import { enHome } from "../../translations/en/index.ts";
import { hiHome } from "../../translations/hi/index.ts";

/**
 * Same translation-key-parity contract as `./i18n.test.ts`, applied to
 * the homepage's own dictionary. Duplicated rather than imported: the
 * homepage and every tool's dictionary are deliberately never compared
 * against each other, only each against its own English source.
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

test("Homepage: every locale has exactly the same keys", () => {
  const enPaths = paths(enHome).sort();
  const hiPaths = paths(hiHome).sort();
  assert.deepEqual(hiPaths, enPaths);
});

test("Homepage: no translated string is empty or left in English by accident", () => {
  for (const path of paths(enHome)) {
    const enValue = at(enHome, path) as string;
    const hiValue = at(hiHome, path) as string;
    assert.equal(typeof hiValue, "string", `${path} must be a string`);
    assert.ok(hiValue.trim().length > 0, `${path} is empty in hi`);
    if (enValue !== "UtilityBazaar") {
      assert.notEqual(hiValue, enValue, `${path} is untranslated in hi`);
    }
  }
});
