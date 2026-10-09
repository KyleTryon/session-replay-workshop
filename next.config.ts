import type { NextConfig } from "next";

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

export default nextConfig;
