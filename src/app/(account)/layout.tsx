// Section: account
// Profile + notification settings. Low value, personal data.
//
// Policy: Never record. Low value, personal data.

import { SessionReplayProvider } from "@/components/session-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionReplayProvider name="account" mode="off">
      {children}
    </SessionReplayProvider>
  );
}
