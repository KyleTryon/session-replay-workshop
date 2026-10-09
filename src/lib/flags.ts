import { InMemoryProvider } from "@openfeature/web-sdk";

// OpenFeature keeps this vendor-neutral. Swap InMemoryProvider for the
// LaunchDarkly, Unleash, Flagsmith, Statsig, etc. provider in real life.
export const FLAGS = {
  aiAbstractHelper: "ai-abstract-helper",
} as const;

export const flagProvider = new InMemoryProvider({
  [FLAGS.aiAbstractHelper]: {
    variants: { on: true, off: false },
    defaultVariant: "off",
    disabled: false,
    // Users who opted into "Beta features" in the header get the new helper.
    contextEvaluator: (ctx) => (ctx.beta ? "on" : "off"),
  },
});
