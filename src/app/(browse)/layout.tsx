// Section: browse
// Landing page + event list. High traffic, low insight.
//
// Policy: Never record. High traffic, nothing to learn.

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="browse" mode="off">
      <div data-sentry-unmask className="contents">
        {children}
      </div>
    </SessionReplayProvider>
  );
}
