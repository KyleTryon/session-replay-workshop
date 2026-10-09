import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Kept off on purpose: the workshop is about Session Replay, not Next.js
  // caching. Everything here behaves like a plain React app with routes.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,
  // Route Sentry traffic through the app so ad blockers on workshop
  // laptops don't eat your replays.
  tunnelRoute: "/monitoring",
});
