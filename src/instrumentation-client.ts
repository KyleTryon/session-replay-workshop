import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 100% in dev, 10% in production. Adjust based on your traffic.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  integrations: [
    // Installed but idle: with both sample rates at 0, nothing records
    // until a <SessionReplayProvider> starts it (src/lib/replay/policies.ts).
    Sentry.replayIntegration(),
  ],

  // Both at 0: nothing records until a <SessionReplayProvider> says so.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
