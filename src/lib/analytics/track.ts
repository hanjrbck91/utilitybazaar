"use client";

import { isAnalyticsEnabled } from "../config.ts";
import { sanitizeEvent, type AnalyticsEventName } from "./events.ts";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

/**
 * Report a product interaction.
 *
 * Safe to call unconditionally: with analytics unconfigured, or before
 * the tag has loaded, this is a no-op. Payloads pass through
 * `sanitizeEvent` first, so nothing outside the allowlist is ever sent
 * even if a caller passes it.
 */
export function track(
  name: AnalyticsEventName,
  params: Record<string, unknown> = {},
): void {
  if (!isAnalyticsEnabled) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const event = sanitizeEvent(name, params);
  if (!event) return;

  window.gtag("event", event.name, event.params);
}
