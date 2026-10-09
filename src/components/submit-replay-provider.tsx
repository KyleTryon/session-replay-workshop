"use client";

import { useBooleanFlagValue } from "@openfeature/react-sdk";
import { SessionReplayProvider } from "@/components/session-replay-provider";
import { FLAGS } from "@/lib/flags";

/**
 * The submit funnel is mature now, so 10% of regular visitors is plenty.
 * But everyone trying the new AI helper gets recorded: that's the rollout
 * we're nervous about.
 */
export function SubmitReplayProvider({ children }: { children: React.ReactNode }) {
  const inBeta = useBooleanFlagValue(FLAGS.aiAbstractHelper, false);

  return (
    <SessionReplayProvider name={inBeta ? "submit-beta" : "submit"} mode="session" sampleRate={inBeta ? 1 : 0.1}>
      {children}
    </SessionReplayProvider>
  );
}
