// Section: event
// Event detail + RSVP. We only care when something breaks.
//
// Policy: buffer the last 60s for everyone; only send it if an error happens.
// Event details are public, so they are unmasked in replays.

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="event" mode="buffer">
      <div data-sentry-unmask className="contents">
        {children}
      </div>
    </SessionReplayProvider>
  );
}
