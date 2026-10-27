"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Tells Sentry who's signed in. Errors, replays and feedback carry the user,
 * and the "Report a bug" form prefills name and email from it.
 */
export function SentryUser({ id, name, email }: { id: string; name: string; email: string }) {
  useEffect(() => {
    Sentry.setUser({ id, username: name, email });
  }, [id, name, email]);

  return null;
}
