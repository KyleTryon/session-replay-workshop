"use client";

import { createContext, use, useEffect, useId } from "react";
import { addPolicy, removePolicy, type ReplayMode } from "@/lib/replay/policies";

type SessionReplayOptions = {
  /** Shown in Sentry as the `replay.policy` tag. */
  name: string;
  mode?: ReplayMode;
  /** 0..1. Chance that a visitor gets `mode` instead of "off". */
  sampleRate?: number;
};

// How deeply providers are nested here. The innermost one wins.
const Depth = createContext(0);

/**
 * Applies a Session Replay policy while the calling component is mounted,
 * overriding the provider around it.
 *
 *   useSessionReplay({ name: "checkout", mode: "session" });
 */
export function useSessionReplay({ name, mode = "session", sampleRate = 1 }: SessionReplayOptions) {
  const id = useId();
  const depth = use(Depth) + 1;

  useEffect(() => {
    addPolicy(id, { name, mode, sampleRate, depth });
    return () => removePolicy(id);
  }, [id, name, mode, sampleRate, depth]);
}

/**
 * Applies a Session Replay policy to everything inside it, for layouts
 * (which are usually Server Components and can't call hooks). Nest them:
 * the innermost provider wins.
 *
 *   <SessionReplayProvider name="submit" mode="session" sampleRate={0.1}>
 */
export function SessionReplayProvider({
  children,
  ...options
}: SessionReplayOptions & { children: React.ReactNode }) {
  useSessionReplay(options);
  return <Depth value={use(Depth) + 1}>{children}</Depth>;
}
