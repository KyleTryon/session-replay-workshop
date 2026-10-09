// Section: event
// Event detail + RSVP. We only care when something breaks.
//
// Policy: buffer the last 60s for everyone; only send it if an error happens.

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="event" mode="buffer">
      {children}
    </SessionReplayProvider>
  );
}
