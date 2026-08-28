"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, Share2, Square, Volume2 } from "lucide-react";
import type { GstBreakdown } from "@/lib/gst";
import { buildSpeechText } from "@/lib/speech/script";
import { useSpeech } from "@/lib/speech/useSpeech";
import { buildShareText } from "@/lib/share/summary";
import { shareOrCopy, type ShareOutcome } from "@/lib/share/share";
import { useLocale } from "@/components/LocaleProvider";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/cn";

interface ResultActionsProps {
  breakdown: GstBreakdown;
}

const BUTTON =
  "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-pill border border-line-strong px-4 py-2.5 " +
  "text-sm font-semibold text-text transition-[color,background-color,border-color,transform] duration-150 ease-out " +
  "hover:border-accent-line hover:bg-accent-soft active:scale-[0.97] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-muted/60 disabled:hover:bg-transparent disabled:active:scale-100";

/** Identifies a result, so a "Copied!" confirmation cannot outlive its figures. */
function signatureOf(breakdown: GstBreakdown): string {
  return [
    breakdown.mode,
    breakdown.taxType,
    breakdown.gstRate,
    breakdown.baseAmount,
    breakdown.total,
  ].join("|");
}

/**
 * Listen and Share, with an optional shop name folded away underneath.
 *
 * "Share" is the single mental model whatever the browser can do: it
 * opens the native share sheet where one exists and copies the summary
 * to the clipboard where it does not, confirming with "Copied!". The
 * label never changes to "Copy" — the capability difference is the
 * browser's concern, not the user's.
 *
 * Everything stays on the device: the summary reaches only the OS share
 * sheet or the clipboard, and analytics only ever learns whether a shop
 * name exists, never the name.
 */
export function ResultActions({ breakdown }: ResultActionsProps) {
  const { locale, d } = useLocale();
  const speech = useSpeech(locale);

  const [showShopName, setShowShopName] = useState(false);
  const [shopName, setShopName] = useState("");
  const [lastOutcome, setLastOutcome] = useState<{
    value: ShareOutcome;
    signature: string;
  } | null>(null);
  const shopInputRef = useRef<HTMLInputElement>(null);
  const resetTimer = useRef<number | null>(null);

  // A confirmation belongs to the figures it was produced from, so changing
  // the amount retires it without an effect having to reset anything.
  const signature = signatureOf(breakdown);
  const outcome = lastOutcome?.signature === signature ? lastOutcome.value : null;

  useEffect(() => {
    if (showShopName) shopInputRef.current?.focus();
  }, [showShopName]);

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleListen = useCallback(() => {
    if (speech.speaking) {
      speech.stop();
      track("audio_used", { locale, action: "stop" });
      return;
    }
    speech.speak(buildSpeechText(breakdown, d));
    track("audio_used", { locale, action: "play" });
  }, [breakdown, d, locale, speech]);

  const handleShare = useCallback(async () => {
    const text = buildShareText({
      breakdown,
      dictionary: d,
      businessName: shopName,
      url: typeof window === "undefined" ? undefined : window.location.origin,
    });

    const result = await shareOrCopy(
      { title: d.actions.shareTitle, text },
      typeof navigator === "undefined" ? undefined : navigator,
    );

    setLastOutcome({ value: result, signature });
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setLastOutcome(null), 2600);

    // Only how the share went — never the summary, the figures, or the
    // shop name. Whether a name was filled in is a boolean, not the text.
    track("share_used", {
      method: result === "copied" || result === "failed" ? "copy" : "native",
      outcome: result,
      has_shop_name: shopName.trim() !== "",
    });
    if (result === "copied" || result === "failed") {
      track("copy_used", { outcome: result });
    }
  }, [breakdown, d, shopName, signature]);

  const voiceMissing = speech.availability === "missing";
  const listenDisabled = !speech.supported || voiceMissing;
  const listenHint = !speech.supported
    ? d.actions.listenUnavailable
    : voiceMissing
      ? d.actions.listenNoVoice
      : undefined;

  const shareCopied = outcome === "copied";

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleListen}
          disabled={listenDisabled}
          title={listenHint}
          aria-label={listenHint}
          className={cn(BUTTON, speech.speaking && "border-accent bg-accent-soft text-accent-strong")}
        >
          {speech.speaking ? (
            <Square className="size-4 shrink-0 fill-current" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4 shrink-0" aria-hidden="true" />
          )}
          {speech.speaking ? d.actions.stop : d.actions.listen}
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label={d.actions.share}
          className={cn(BUTTON, shareCopied && "border-accent bg-accent-soft text-accent-strong")}
        >
          {shareCopied ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Share2 className="size-4 shrink-0" aria-hidden="true" />
          )}
          {shareCopied ? d.actions.copied : d.actions.share}
        </button>
      </div>

      <div className="mt-2.5">
        <button
          type="button"
          onClick={() => setShowShopName((open) => !open)}
          aria-expanded={showShopName}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-[8px] px-1.5 text-xs font-medium text-muted",
            "transition-colors duration-150 hover:text-accent-strong",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          {showShopName ? (
            <Minus className="size-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Plus className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {showShopName ? d.actions.hideShopName : d.actions.addShopName}
        </button>

        {showShopName && (
          <div className="mt-2 motion-safe:animate-fade-in">
            <label
              htmlFor="shop-name"
              className="block px-1 text-xs font-semibold uppercase tracking-[0.09em] text-muted"
            >
              {d.actions.shopNameHeading}
            </label>
            <input
              ref={shopInputRef}
              id="shop-name"
              type="text"
              value={shopName}
              onChange={(event) => setShopName(event.currentTarget.value)}
              maxLength={60}
              autoComplete="organization"
              aria-describedby="shop-name-hint"
              placeholder={d.actions.shopNamePlaceholder}
              className={cn(
                "mt-1.5 w-full rounded-control border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-text",
                "transition-[border-color,box-shadow] duration-150 ease-out outline-none",
                "placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/15",
              )}
            />
            <p id="shop-name-hint" className="mt-1.5 px-1 text-xs text-muted">
              {d.actions.shopNameOptionalHint}
            </p>
          </div>
        )}
      </div>

      {/* Announcements for screen readers: speaking state and share outcome. */}
      <p className="sr-only" aria-live="polite">
        {speech.speaking ? d.actions.speaking : ""}
      </p>
      <p
        className={cn("px-1 text-xs", outcome === "failed" ? "mt-2 text-danger" : "sr-only")}
        aria-live="polite"
      >
        {shareCopied ? d.actions.copied : outcome === "failed" ? d.actions.copyFailed : ""}
      </p>
    </div>
  );
}
