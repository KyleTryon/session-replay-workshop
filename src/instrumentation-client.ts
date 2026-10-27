import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 100% in dev, 10% in production. Adjust based on your traffic.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  integrations: [
    // Installed but idle: with both sample rates at 0, nothing records
    // until a <SessionReplayProvider> starts it (src/lib/replay/policies.ts).
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
      // No default for unmask, so we pick one. Nearest ancestor wins:
      // data-sentry-mask inside an unmasked area is masked again.
      unmask: ["[data-sentry-unmask]"],
    }),
    // The "Report a bug" button, bottom right. Opening it sends whatever
    // Replay is holding (a buffer or a running session) and links that
    // replay to the feedback. Where no policy is buffering or recording,
    // feedback arrives without a replay.
    Sentry.feedbackIntegration({
      colorScheme: "light",
      triggerLabel: "Report a bug",
      formTitle: "Report a bug",
      submitButtonLabel: "Send report",
      messagePlaceholder: "What went wrong? What did you expect?",
    }),
    // Records flag evaluations on error events, so issues show which
    // flags were on. Pairs with the hook added in flags-provider.tsx.
    Sentry.openFeatureIntegration(),
  ],

  // Both at 0: nothing records until a <SessionReplayProvider> says so.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
