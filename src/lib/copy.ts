/**
 * Copy text to the clipboard.
 *
 * Never throws: an unsupported or blocked clipboard is a normal outcome
 * (older browsers, insecure context, denied permission), not a bug, so
 * callers get a plain boolean rather than a caught exception.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
