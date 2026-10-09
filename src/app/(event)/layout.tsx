// Section: event
// Event detail + RSVP. We only care when something breaks.
//
// Policy: off for now. We only care when the RSVP breaks (see 03-buffer).

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="event" mode="off">
      {children}
    </SessionReplayProvider>
  );
}
