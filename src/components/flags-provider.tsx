"use client";

import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { flagProvider } from "@/lib/flags";

OpenFeature.setProvider(flagProvider);
// Client components also render on the server; the Sentry hook is browser-only.
if (typeof window !== "undefined") {
  OpenFeature.addHooks(new Sentry.OpenFeatureIntegrationHook());
}

export function FlagsProvider({
  userId,
  role,
  beta,
  children,
}: {
  userId: string;
  role: string;
  beta: boolean;
  children: React.ReactNode;
}) {
  // Keep the flag evaluation context in sync with the signed-in user.
  useEffect(() => {
    OpenFeature.setContext({ targetingKey: userId, role, beta });
  }, [userId, role, beta]);

  return <OpenFeatureProvider>{children}</OpenFeatureProvider>;
}
