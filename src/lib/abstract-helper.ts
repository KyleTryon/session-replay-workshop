// "AI" abstract helper. It is a template, not a model. Gated behind the
// `ai-abstract-helper` flag.
import type { TalkDraft } from "./talk";

const TONE: Record<string, { opener: string; promise: string }> = {
  beginner: {
    opener: "Never touched this before? Perfect.",
    promise: "You'll leave knowing where to start and what to ignore.",
  },
  practitioner: {
    opener: "You already use this every day.",
    promise: "You'll leave with a few tricks you can try tomorrow morning.",
  },
  expert: {
    opener: "Let's skip the intro slides.",
    promise: "We'll go straight to the sharp edges and how to sand them down.",
  },
};

export function draftAbstract(draft: TalkDraft): string {
  const tone = TONE[draft.audience];
  const minutes = draft.format === "lightning" ? 5 : draft.format === "demo" ? 10 : 20;
  return [
    tone.opener,
    `In ${minutes} minutes, ${draft.speakerName.split(" ")[0]} walks through "${draft.title.trim()}":`,
    "what worked, what didn't, and what they'd do differently next time.",
    tone.promise,
  ].join(" ");
}
