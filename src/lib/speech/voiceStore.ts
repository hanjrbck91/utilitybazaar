"use client";

import type { VoiceLike } from "./voice.ts";

/**
 * External store for `speechSynthesis.getVoices()`.
 *
 * The voice list is populated asynchronously and `getVoices()` returns a
 * fresh array every call, so it is kept here as a stable snapshot that
 * `useSyncExternalStore` can read without tearing or re-render loops.
 */
export interface VoiceSnapshot {
  voices: VoiceLike[];
  /** True once we believe the engine has finished populating the list. */
  loaded: boolean;
}

const EMPTY: VoiceSnapshot = { voices: [], loaded: false };

let snapshot: VoiceSnapshot = EMPTY;
const listeners = new Set<() => void>();

function hasSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function sameVoices(a: ReadonlyArray<VoiceLike>, b: ReadonlyArray<VoiceLike>): boolean {
  return (
    a.length === b.length &&
    a.every((voice, i) => voice.lang === b[i].lang && voice.name === b[i].name)
  );
}

/** Re-read the engine. Returns true when the snapshot actually changed. */
function refresh(markLoaded: boolean): boolean {
  if (!hasSynthesis()) return false;

  const voices = window.speechSynthesis.getVoices();
  const loaded = snapshot.loaded || markLoaded || voices.length > 0;

  if (loaded === snapshot.loaded && sameVoices(voices, snapshot.voices)) return false;

  snapshot = { voices, loaded };
  return true;
}

export function subscribeVoices(listener: () => void): () => void {
  listeners.add(listener);

  if (!hasSynthesis()) {
    return () => {
      listeners.delete(listener);
    };
  }

  const synth = window.speechSynthesis;

  const notify = () => {
    if (refresh(true)) listeners.forEach((fn) => fn());
  };

  synth.addEventListener("voiceschanged", notify);

  // Some engines never fire voiceschanged. Stop waiting after a moment so
  // the UI can settle on a definite answer instead of hedging forever.
  const timer = window.setTimeout(notify, 1500);

  // Seed without notifying — useSyncExternalStore re-reads right after this.
  refresh(false);

  return () => {
    listeners.delete(listener);
    synth.removeEventListener("voiceschanged", notify);
    window.clearTimeout(timer);
  };
}

export function getVoiceSnapshot(): VoiceSnapshot {
  return snapshot;
}

/** The server has no speech engine. */
export function getServerVoiceSnapshot(): VoiceSnapshot {
  return EMPTY;
}
