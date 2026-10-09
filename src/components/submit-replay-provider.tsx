"use client";

import { useBooleanFlagValue } from "@openfeature/react-sdk";
import { SessionReplayProvider } from "@/components/session-replay-provider";
import { FLAGS } from "@/lib/flags";

/**
 * The submit funnel is mature, so we only want to watch the people who
 * give up: everyone buffers, and the last ~60 seconds are sent if they
 * leave without submitting. Everyone trying the new AI helper is recorded
 * in full: that's the rollout we're nervous about.
 */
export function SubmitReplayProvider({ children }: { children: React.ReactNode }) {
  const inBeta = useBooleanFlagValue(FLAGS.aiAbstractHelper, false);

  return inBeta ? (
    <SessionReplayProvider name="submit-beta" mode="session">
      {children}
    </SessionReplayProvider>
  ) : (
    <SessionReplayProvider name="submit" mode="buffer" sendOnLeave>
      {children}
    </SessionReplayProvider>
  );
}
