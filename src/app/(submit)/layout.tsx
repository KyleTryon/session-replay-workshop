// Section: submit
// Talk submission wizard. The funnel we actually want to watch.
//
// Policy: record 100% of visits.

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="submit" mode="session">
      {children}
    </SessionReplayProvider>
  );
}
