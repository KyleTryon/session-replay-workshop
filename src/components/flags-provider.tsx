"use client";

import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";
import { useEffect } from "react";
import { flagProvider } from "@/lib/flags";

OpenFeature.setProvider(flagProvider);

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
