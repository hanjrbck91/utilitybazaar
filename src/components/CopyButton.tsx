"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  /** Computed lazily on click, so it always reflects the current result. */
  getText: () => string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  className?: string;
}

/**
 * A compact icon button that copies text to the clipboard, with brief
 * "Copied!" feedback that reverts on its own.
 *
 * Shared across every calculator: each one builds its own result text
 * (GST's from `buildShareText`, Percentage's from its own copy
 * templates) and hands it to this component, which owns only the
 * clipboard mechanics, feedback and accessibility — never the text
 * itself, so no calculator's result format lives in here.
 */
export function CopyButton({ getText, label, copiedLabel, failedLabel, className }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleClick = async () => {
    const ok = await copyToClipboard(getText());
    setStatus(ok ? "copied" : "failed");
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setStatus("idle"), 2000);
  };

  const currentLabel = status === "copied" ? copiedLabel : status === "failed" ? failedLabel : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={currentLabel}
      title={currentLabel}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-pill text-muted",
        "transition-[color,background-color,transform] duration-150 ease-out",
        "hover:bg-surface-sunken hover:text-text active:scale-95",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        status === "copied" && "text-accent-strong",
        className,
      )}
    >
      {status === "copied" ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {status !== "idle" ? currentLabel : ""}
      </span>
    </button>
  );
}
