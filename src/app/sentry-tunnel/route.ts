// Handles `tunnelRoute` from next.config.ts. Forwards only the Sentry event,
// not request headers or cookies, and only for this app's DSN.
export { POST } from "@sentry/nextjs/tunnel";
