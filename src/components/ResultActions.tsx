"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2, Square, Volume2 } from "lucide-react";
import type { GstBreakdown } from "@/lib/gst";
import { buildSpeechText } from "@/lib/speech/script";
import { useSpeech } from "@/lib/speech/useSpeech";
import { buildShareText } from "@/lib/share/summary";
import { canNativeShare, shareOrCopy, type ShareOutcome } from "@/lib/share/share";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

interface ResultActionsProps {
  /** `null` while there is no valid result — the row stays mounted but inert. */
  breakdown: GstBreakdown | null;
}

const BUTTON =
  "flex min-h-9 items-center justify-center gap-1.5 rounded-pill border border-line-strong px-3.5 py-2 " +
  "text-sm font-medium text-muted transition-[color,background-color,border-color,transform] duration-150 ease-out " +
  "hover:border-muted/50 hover:text-text active:scale-[0.96] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:text-muted disabled:active:scale-100";

/** Identifies a result, so a "Copied" confirmation cannot outlive its figures. */
function signatureOf(breakdown: GstBreakdown | null): string {
  if (!breakdown) return "";
  return [
    breakdown.mode,
    breakdown.taxType,
    breakdown.gstRate,
    breakdown.baseAmount,
    breakdown.total,
  ].join("|");
}

const noopSubscribe = () => () => {};
const detectNativeShare = () =>
  canNativeShare(navigator, { title: "GST", text: "GST calculation" });
const nativeShareOnServer = () => false;

/**
 * Listen / Share, plus an optional shop name for the share text.
 *
 * The row is visible only once a valid result exists, but it stays
 * mounted and `inert` before then. Rendering it conditionally would move
 * the page on the first calculation, and by a different amount depending
 * on whether the buttons wrap — reserving a fixed height cannot cover
 * every viewport, whereas keeping the real markup always can.
 */
export function ResultActions({ breakdown }: ResultActionsProps) {
  const { locale, d } = useLocale();
  const speech = useSpeech(locale);

  // Feature-detected on the client: the server has no `navigator`, and
  // deciding during render would produce a hydration mismatch.
  const nativeShare = useSyncExternalStore(
    noopSubscribe,
    detectNativeShare,
    nativeShareOnServer,
  );

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
      return;
    }
    if (!breakdown) return;
    speech.speak(buildSpeechText(breakdown, d));
  }, [breakdown, d, speech]);

  const handleShare = useCallback(async () => {
    if (!breakdown) return;
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
  }, [breakdown, d, shopName, signature]);

  const voiceMissing = speech.availability === "missing";
  const listenDisabled = !speech.supported || voiceMissing;
  const listenHint = !speech.supported
    ? d.actions.listenUnavailable
    : voiceMissing
      ? d.actions.listenNoVoice
      : undefined;

  const shareLabel =
    outcome === "copied"
      ? d.actions.copied
      : nativeShare
        ? d.actions.share
        : d.actions.copy;

  const idle = breakdown === null;

  return (
    <div
      inert={idle}
      aria-hidden={idle}
      className={cn(
        "transition-opacity duration-200 ease-out",
        idle && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleListen}
          disabled={listenDisabled}
          title={listenHint}
          aria-label={listenHint}
          className={cn(BUTTON, speech.speaking && "border-accent text-accent-strong")}
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
          className={cn(BUTTON, outcome === "copied" && "border-accent text-accent-strong")}
        >
          {outcome === "copied" ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : nativeShare ? (
            <Share2 className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Copy className="size-4 shrink-0" aria-hidden="true" />
          )}
          {shareLabel}
        </button>

        <button
          type="button"
          onClick={() => setShowShopName((open) => !open)}
          aria-expanded={showShopName}
          className={cn(
            "min-h-9 rounded-pill px-2.5 py-2 text-sm font-medium text-muted transition-colors duration-150",
            "hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          {showShopName ? d.actions.hideShopName : d.actions.addShopName}
        </button>
      </div>

      {showShopName && (
        <div className="mt-2.5 motion-safe:animate-fade-in">
          <input
            ref={shopInputRef}
            type="text"
            value={shopName}
            onChange={(event) => setShopName(event.currentTarget.value)}
            maxLength={60}
            autoComplete="organization"
            aria-label={d.actions.shopNameLabel}
            placeholder={d.actions.shopNamePlaceholder}
            className={cn(
              "w-full rounded-control border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-text",
              "transition-[border-color,box-shadow] duration-150 ease-out outline-none",
              "placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/20",
            )}
          />
        </div>
      )}

      {/* Announcements for screen readers: speaking state and share outcome. */}
      <p className="sr-only" aria-live="polite">
        {speech.speaking ? d.actions.speaking : ""}
      </p>
      <p
        className={cn(
          "px-1 text-xs",
          outcome === "failed" ? "pt-1.5 text-danger" : "sr-only",
        )}
        aria-live="polite"
      >
        {outcome === "copied"
          ? d.actions.copied
          : outcome === "failed"
            ? d.actions.copyFailed
            : ""}
      </p>
    </div>
  );
}
