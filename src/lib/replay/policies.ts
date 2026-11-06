"use client";

import * as Sentry from "@sentry/nextjs";

export type ReplayMode = "off" | "buffer" | "session";

export type ReplayPolicy = {
  /** Shown in Sentry as the `replay.policy` tag. */
  name: string;
  /** What to do when this policy is sampled in. */
  mode: ReplayMode;
  /** 0..1. Chance that a visitor gets `mode` instead of "off". */
  sampleRate: number;
  /** If the visitor leaves while it's buffering, send the buffer. */
  sendOnLeave?: boolean;
};

type ActivePolicy = ReplayPolicy & { depth: number };

// Every mounted provider's policy. The deepest one decides, so a layout can
// override the one around it. Providers only say what they want; the
// queued tasks below make Replay match.
const active = new Map<string, ActivePolicy>();
let wanted: ReplayMode = "off";
let currentPolicy = "none";
// One roll per policy per page load, so leaving and coming back
// isn't a second chance to be sampled.
const rolls = new Map<string, boolean>();

export function addPolicy(id: string, policy: ActivePolicy) {
  watch();
  active.set(id, policy);
  update();
}

export function removePolicy(id: string) {
  const policy = active.get(id);
  if (policy?.sendOnLeave) enqueue(() => sendIfGone(id, policy.name));
  active.delete(id);
  update();
}

function update() {
  let policy: ActivePolicy | undefined;
  for (const p of active.values()) if (!policy || p.depth > policy.depth) policy = p;

  if (policy && !rolls.has(policy.name)) rolls.set(policy.name, Math.random() < policy.sampleRate);
  wanted = policy && rolls.get(policy.name) ? policy.mode : "off";
  currentPolicy = policy?.name ?? "none";
  Sentry.setTag("replay.policy", currentPolicy);
  enqueue(apply);
}

// stop() is async, and start() before it finishes records nothing, so
// tasks run one at a time. Each acts on the latest state, which also
// means navigating from one section to the next is a single change.
let queue = Promise.resolve();
function enqueue(task: () => unknown) {
  queue = queue.then(task).then(
    () => {},
    (err) => console.warn("Session Replay:", err),
  );
}

async function apply() {
  const replay = Sentry.getReplay();
  if (!replay) return;

  const target = wanted;
  const current = replay.getRecordingMode() ?? "off";
  if (current === target) return; // e.g. two session policies in a row: one continuous replay

  if (current !== "off") await replay.stop();
  if (target === "session") replay.start();
  if (target === "buffer") replay.startBuffering();
}

// Checked once queued tasks run, not on unmount: React remounts providers
// in development, and one whose props change is removed and re-added.
async function sendIfGone(id: string, name: string) {
  const replay = Sentry.getReplay();
  if (active.has(id) || replay?.getRecordingMode() !== "buffer") return;
  // The tag already names the next section; send the buffer under its own.
  Sentry.setTag("replay.policy", name);
  await replay.flush();
  Sentry.setTag("replay.policy", currentPolicy);
}

let watching = false;
function watch() {
  const client = Sentry.getClient();
  if (watching || !client) return;
  watching = true;

  // A buffered replay is only sent for errors tagged with its ID, and with
  // replaysOnErrorSampleRate at 0 the SDK doesn't add that tag. So we do,
  // and the SDK flushes the buffer once the error has been sent.
  client.on("preprocessEvent", (event) => {
    const replay = Sentry.getReplay();
    if (!event.type && event.exception && replay?.getRecordingMode() === "buffer") {
      event.tags = { ...event.tags, replayId: replay.getReplayId() };
    }
  });

  // Replays end after 15 minutes idle or 60 minutes total. Start the
  // current policy's again (after stop() has finished).
  client.on("replayEnd", ({ reason }) => {
    if (reason === "sessionExpired") setTimeout(() => enqueue(apply));
  });
}
