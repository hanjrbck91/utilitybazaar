/**
 * Sharing with a copy-to-clipboard fallback.
 *
 * Everything is injected, so the whole decision tree is testable without
 * a browser and nothing here talks to a server — the summary only ever
 * reaches the OS share sheet or the clipboard.
 */

export type ShareOutcome = "shared" | "copied" | "dismissed" | "failed";

export interface ShareData {
  title?: string;
  text: string;
}

/** The slice of `navigator` we rely on. */
export interface ShareNavigatorLike {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
  clipboard?: { writeText?: (text: string) => Promise<void> };
}

/**
 * Whether a native share sheet can handle this payload.
 *
 * `share` alone is not enough: `canShare` is consulted when present, so
 * a browser that exposes the API but refuses text payloads falls back to
 * copying instead of throwing at the user.
 */
export function canNativeShare(
  nav: ShareNavigatorLike | undefined,
  data: ShareData,
): boolean {
  if (!nav || typeof nav.share !== "function") return false;
  if (typeof nav.canShare === "function") {
    try {
      return nav.canShare(data);
    } catch {
      return false;
    }
  }
  return true;
}

/** True when the clipboard fallback is usable. */
export function canCopy(nav: ShareNavigatorLike | undefined): boolean {
  return typeof nav?.clipboard?.writeText === "function";
}

/** A user cancelling the OS share sheet rejects with an AbortError. */
function isAbort(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

/**
 * Share natively when possible, otherwise copy.
 *
 * Returns what actually happened so the UI can show the right
 * confirmation — a native share gives no success signal of its own.
 */
export async function shareOrCopy(
  data: ShareData,
  nav: ShareNavigatorLike | undefined,
): Promise<ShareOutcome> {
  if (canNativeShare(nav, data)) {
    try {
      await nav!.share!(data);
      return "shared";
    } catch (error) {
      if (isAbort(error)) return "dismissed";
      // Fall through to copying rather than dead-ending the action.
    }
  }

  if (canCopy(nav)) {
    try {
      await nav!.clipboard!.writeText!(data.text);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}
