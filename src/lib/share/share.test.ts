import assert from "node:assert/strict";
import test from "node:test";

import {
  canCopy,
  canNativeShare,
  shareOrCopy,
  type ShareNavigatorLike,
} from "./share.ts";

// --- capability detection --------------------------------------------

const DATA = { title: "GST calculation", text: "GST is 1,800" };

test("canNativeShare requires navigator.share", () => {
  assert.equal(canNativeShare(undefined, DATA), false);
  assert.equal(canNativeShare({}, DATA), false);
  assert.equal(canNativeShare({ share: async () => {} }, DATA), true);
});

test("canNativeShare respects canShare when present", () => {
  assert.equal(
    canNativeShare({ share: async () => {}, canShare: () => false }, DATA),
    false,
  );
  assert.equal(
    canNativeShare({ share: async () => {}, canShare: () => true }, DATA),
    true,
  );
});

test("canNativeShare treats a throwing canShare as unsupported", () => {
  assert.equal(
    canNativeShare(
      {
        share: async () => {},
        canShare: () => {
          throw new Error("nope");
        },
      },
      DATA,
    ),
    false,
  );
});

test("canCopy detects the clipboard fallback", () => {
  assert.equal(canCopy(undefined), false);
  assert.equal(canCopy({}), false);
  assert.equal(canCopy({ clipboard: {} }), false);
  assert.equal(canCopy({ clipboard: { writeText: async () => {} } }), true);
});

// --- share behaviour --------------------------------------------------

test("uses the native share sheet when available", async () => {
  const seen: unknown[] = [];
  const nav: ShareNavigatorLike = {
    share: async (data) => {
      seen.push(data);
    },
  };
  assert.equal(await shareOrCopy(DATA, nav), "shared");
  assert.deepEqual(seen, [DATA]);
});

test("falls back to copying when native share is unsupported", async () => {
  let copied: string | null = null;
  const nav: ShareNavigatorLike = {
    clipboard: {
      writeText: async (text) => {
        copied = text;
      },
    },
  };
  assert.equal(await shareOrCopy(DATA, nav), "copied");
  assert.equal(copied, DATA.text);
});

test("a dismissed share sheet is not treated as a failure", async () => {
  const abort = Object.assign(new Error("cancelled"), { name: "AbortError" });
  let copied = false;
  const nav: ShareNavigatorLike = {
    share: async () => {
      throw abort;
    },
    clipboard: {
      writeText: async () => {
        copied = true;
      },
    },
  };
  assert.equal(await shareOrCopy(DATA, nav), "dismissed");
  assert.equal(copied, false, "must not copy behind the user's back");
});

test("a broken share sheet still copies", async () => {
  let copied = false;
  const nav: ShareNavigatorLike = {
    share: async () => {
      throw new Error("share target exploded");
    },
    clipboard: {
      writeText: async () => {
        copied = true;
      },
    },
  };
  assert.equal(await shareOrCopy(DATA, nav), "copied");
  assert.equal(copied, true);
});

test("reports failure when neither sharing nor copying is possible", async () => {
  assert.equal(await shareOrCopy(DATA, {}), "failed");
  assert.equal(await shareOrCopy(DATA, undefined), "failed");
  assert.equal(
    await shareOrCopy(DATA, {
      clipboard: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    }),
    "failed",
  );
});
