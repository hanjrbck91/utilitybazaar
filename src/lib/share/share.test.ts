import assert from "node:assert/strict";
import test from "node:test";

import { calculateGst, type GstInput } from "../gst/index.ts";
import { getDictionary } from "../i18n/index.ts";
import { buildShareText } from "./summary.ts";
import {
  canCopy,
  canNativeShare,
  shareOrCopy,
  type ShareNavigatorLike,
} from "./share.ts";

const en = getDictionary("en");
const hi = getDictionary("hi");

const ADD_INTRA: GstInput = {
  amount: 10_000,
  mode: "add",
  gstRate: 18,
  taxType: "intraState",
};

// --- share text ------------------------------------------------------

test("share text lists the figures, input first and answer last", () => {
  const text = buildShareText({ breakdown: calculateGst(ADD_INTRA), dictionary: en });
  assert.equal(
    text,
    [
      "GST calculation — GST added",
      "",
      "Amount before GST: ₹10,000",
      "GST (18%): ₹1,800",
      "CGST: ₹900",
      "SGST: ₹900",
      "Total amount: ₹11,800",
    ].join("\n"),
  );
});

test("remove mode ends on the amount before GST", () => {
  const text = buildShareText({
    breakdown: calculateGst({ ...ADD_INTRA, amount: 11_800, mode: "remove" }),
    dictionary: en,
  });
  const lines = text.split("\n");
  assert.equal(lines[0], "GST calculation — GST removed");
  assert.equal(lines[2], "Total amount: ₹11,800");
  assert.equal(lines.at(-1), "Amount before GST: ₹10,000");
});

test("inter-state shows IGST instead of CGST and SGST", () => {
  const text = buildShareText({
    breakdown: calculateGst({ ...ADD_INTRA, taxType: "interState" }),
    dictionary: en,
  });
  assert.match(text, /IGST: ₹1,800/);
  assert.doesNotMatch(text, /CGST|SGST/);
});

test("shop name and url are optional and trimmed", () => {
  const breakdown = calculateGst(ADD_INTRA);

  const bare = buildShareText({ breakdown, dictionary: en });
  assert.doesNotMatch(bare, /https?:/);

  const full = buildShareText({
    breakdown,
    dictionary: en,
    businessName: "  Sharma Traders  ",
    url: "https://example.test",
  });
  assert.equal(full.split("\n")[0], "Sharma Traders");
  assert.equal(full.split("\n").at(-1), "https://example.test");

  const blank = buildShareText({ breakdown, dictionary: en, businessName: "   ", url: "  " });
  assert.equal(blank, bare);
});

test("share text is localized without touching numbers or rates", () => {
  const text = buildShareText({
    breakdown: calculateGst(ADD_INTRA),
    dictionary: hi,
  });
  assert.match(text, /GST हिसाब — GST जोड़ा गया/);
  assert.match(text, /कुल राशि: ₹11,800/);
  // Figures, currency and the rate stay identical across locales.
  assert.match(text, /GST \(18%\): ₹1,800/);
  assert.match(text, /CGST: ₹900/);
});

test("share text stays short enough for a message", () => {
  const text = buildShareText({
    breakdown: calculateGst(ADD_INTRA),
    dictionary: en,
    businessName: "Sharma Traders",
    url: "https://example.test",
  });
  assert.ok(text.length < 300, `share text was ${text.length} characters`);
  assert.ok(text.split("\n").length <= 11);
});

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
