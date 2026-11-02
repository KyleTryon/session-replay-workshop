# Meetup.local: Session Replay workshop

A small meetup app (events, RSVPs, a talk submission wizard, an organizer
dashboard) used to teach **intentional Session Replay**: record the parts of
your app you actually care about, at the rate you choose, and stop paying to
watch people idle on settings pages.

## Run it

You need Node.js 20.19+ and [pnpm](https://pnpm.io/installation)
(`corepack enable` picks up the version pinned in `package.json`).

```bash
git clone https://github.com/TechSquidTV/session-replay-workshop.git
cd session-replay-workshop
git checkout 00-start
pnpm install
pnpm dev
```

Open http://localhost:3000. No database, no Docker. Data lives in memory and
resets when the server restarts. Use the header to switch users
(attendee / speaker / organizer) and to opt into **Beta features**.

From `01-naive` onward you need a Sentry DSN (Project Settings → Client
Keys). Restart `pnpm dev` after adding it:

```bash
cp .env.example .env.local   # then paste your DSN
```

`SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` in the same file are
optional; they upload source maps during `pnpm build` so stack traces are
readable.

## Follow along

Each workshop step is a branch, and each branch is one commit on top of the
previous one. Start at `00-start`:

```bash
git checkout 00-start
```

| Branch | What changes |
|---|---|
| `00-start` | The app, no Sentry |
| `01-naive` | The default setup: 10% of sessions everywhere, 100% on error |
| `02-providers` | Sample rates to 0. An app-wide default in the root layout, overridden per section with `<SessionReplayProvider>` |
| `03-buffer` | Buffer mode for the RSVP page: only send a replay when something breaks |
| `04-flags` | Record 100% of the beta cohort on `/submit`, 10% of everyone else; send flag evaluations to Sentry |
| `05-privacy` | Masking, blocking, and unmasking. Keep PII sections out entirely |
| `06-funnels` | Count each step of the talk wizard; send replays only for people who give up |

`main` is the finished state (the same as `06-funnels`).

- **Fall behind?** `git checkout <branch>` and keep going. If you changed
  files, `git stash` first (or `git checkout -f <branch>` to throw your
  changes away).
- **Run `pnpm install`** after moving from `00-start` to a later branch:
  `01-naive` is where `@sentry/nextjs` arrives.
- **See what a step changed:** `git diff 02-providers 03-buffer`.

This README is the same on every branch and describes the finished code.
Each section under "How it works" says which step adds it.

## Stack (all boring on purpose)

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Layouts and route groups map neatly to replay policies |
| Styling | Tailwind | Nothing to learn |
| Data | In-memory store (`src/lib/data.ts`) | Zero setup |
| Auth | Cookie-based user switcher | Lets you demo sampling by role |
| Flags | OpenFeature + `InMemoryProvider` | Vendor-neutral; swap in LaunchDarkly, Unleash, Statsig, etc. |
| Monitoring | `@sentry/nextjs` | The thing we're here for |

The replay logic lives in plain React components and hooks, so it carries
over to Vite, React Router, Remix, or anything else with a component tree.

## The app, by section

Each route group under `src/app/(…)` has its own layout, so each section
can declare its own replay policy (or inherit the app default) without
changing any URLs.

| Section | Routes | What's there |
|---|---|---|
| `(browse)` | `/`, `/events` | Landing page and event list |
| `(event)` | `/events/[id]` | Event detail and RSVP button |
| `(submit)` | `/submit` | Four-step talk submission wizard (+ a beta "Draft it for me" helper) |
| `(account)` | `/account` | Profile and notification settings |
| `(admin)` | `/admin` | Organizer dashboard: attendee list with emails and phone numbers |

## How it works

Three pieces: Replay is installed but idle, layouts wrap their pages in a
`<SessionReplayProvider>` (components can call the `useSessionReplay()`
hook instead), and a small module,
[`src/lib/replay/policies.ts`](src/lib/replay/policies.ts), turns recording
on and off to match.

### 1. Install Replay, record nothing (`02-providers`)

In [`src/instrumentation-client.ts`](src/instrumentation-client.ts), Replay
is added to `Sentry.init` with both sample rates at 0. That's Sentry's
documented way to say "I'll start it myself".

```ts
Sentry.init({
  integrations: [Sentry.replayIntegration({ maskAllText: true, /* … */ })],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
```

### 2. Providers, from the root down (`02-providers`)

```tsx
// src/app/layout.tsx: the default for the whole app
<SessionReplayProvider name="app" mode="session" sampleRate={0.1}>…</SessionReplayProvider>

// src/app/(event)/layout.tsx: this section overrides it
<SessionReplayProvider name="event" mode="buffer">{children}</SessionReplayProvider>
```

Providers nest and the innermost one wins, so you set a default once and
override it further down the tree. A section without a provider of its
own inherits the one around it.

A provider takes a `name` (sent to Sentry as the `replay.policy` tag), a
`mode`, a `sampleRate` (default 1), and optionally `sendOnLeave` (see
Funnels below):

| Mode | What Replay does |
|---|---|
| `off` | Nothing |
| `buffer` | Keeps the last ~60 seconds in memory and sends it only if an error happens |
| `session` | Records and sends everything |

The policies on `main` (earlier steps build up to these):

| Policy | Mode | Rate | Why |
|---|---|---|---|
| `app` (root layout) | `session` | 10% | The default for anything without its own provider |
| `browse` | `off` | | High traffic, nothing to learn |
| `event` | `buffer` | 100% | Only interesting when the RSVP breaks |
| `submit` | `buffer`, sent if they leave without submitting | 100% | Stable funnel: watch only the people who give up |
| `submit-beta` | `session` | 100% | Beta flag on: watch everyone using the new helper |
| `account` | `off` | | Low value, personal data |
| `admin` | inherits `app` | 10% | No provider of its own; the attendee table is blocked |

### 3. Keeping Replay in sync (`02-providers`)

[`session-replay-provider.tsx`](src/components/session-replay-provider.tsx)
has the hook and the provider. The hook calls `addPolicy()` in an effect
and `removePolicy()` in its cleanup; the provider calls the hook and tells
nested providers how deep they are. Layouts use the provider because
they're usually Server Components and can't call hooks.

`policies.ts` keeps module-level state, the way most SDK wrappers do,
since Replay itself is a global. Adding and removing policies only records
what's wanted; queued tasks make Replay match:

- **Innermost wins.** Each provider knows how deep it is in the tree (via
  React context), and the deepest one mounted decides. The hook overrides
  the provider around it, but nothing nested inside its component can
  override the hook, because hooks can't provide context. Use the provider
  when you need that.
- **Sampling.** Each policy rolls the dice once per page load, so leaving
  and coming back isn't a second chance.
- **One change at a time.** Replay's `stop()` is async, and calling
  `start()` before it finishes records nothing, so changes run one after
  another. Each one reads the *latest* wanted mode, so navigating between
  sections is a single change, and two `session` policies in a row stay one
  continuous replay.
- **Session expiry.** Replay ends a session after 15 minutes idle or 60
  minutes total. With both rates at 0 nothing would restart it, so
  `policies.ts` applies the current policy again on `replayEnd` with reason
  `sessionExpired`.

### 4. Buffer mode: only send when something breaks (`03-buffer`)

The SDK only sends a buffer for errors tagged with that replay's ID, and
with `replaysOnErrorSampleRate: 0` it never adds the tag. So
`policies.ts` adds it in a `preprocessEvent` hook. Once the tagged error has
been sent, the SDK uploads the buffer (the ~60 seconds before the error)
and keeps recording as a session until you leave that section.

### 5. Feature flags pick the cohort (`04-flags`)

[`submit-replay-provider.tsx`](src/components/submit-replay-provider.tsx)
reads the `ai-abstract-helper` flag through OpenFeature. Beta users get a
`submit-beta` policy, recorded in full: a new feature gets a higher rate
than stable code. `Sentry.openFeatureIntegration()` attaches flag values to
errors, so you can filter issues and replays by cohort.

### 6. Privacy (`05-privacy`)

Everything is masked by default (`maskAllText`, `maskAllInputs`,
`blockAllMedia`). Public areas opt back in with `data-sentry-unmask`, and
`data-sentry-mask` re-masks anything inside them, such as what people type
in the wizard. The admin attendee table has `data-sentry-block`, so it's
never captured at all, and the account section is never recorded.

### 7. Funnels: count every step, watch the people who quit (`06-funnels`)

The talk wizard is a four-step funnel. Each step someone completes counts
a metric:

```ts
Sentry.metrics.count("submit_funnel", 1, { attributes: { step } });
```

Chart `submit_funnel` grouped by `step` (Explore → Metrics) and the drops
between bars are where people give up. Every metric carries the ID of the
replay that was recording at the time (`sentry.replay_id`), so you can go
from a drop straight to replays.

To have replays worth watching, regular (non-beta) visitors buffer on
`/submit` with `sendOnLeave`: if they leave mid-funnel, the last ~60
seconds are sent. The success screen calls
`useSessionReplay({ name: "submit-done", mode: "off" })`, so people who
finish are never sent. Only the people who quit are.

In this app the drop is at **Abstract**, and the replays show why.

### Also in the box (`01-naive`)

- **Ad blockers.** `tunnelRoute: "/sentry-tunnel"` in `next.config.ts` sends
  Sentry traffic through the app, and `src/app/sentry-tunnel/route.ts`
  forwards only the event to Sentry, not cookies or headers.
- **Debug badge.** Bottom right: `○ not recording`, `◐ buffering`, or
  `● REC session`, plus the replay ID.

## Use it in your app

The reusable part is two files. Everything else is the demo app.

| File | What it is |
|---|---|
| `src/lib/replay/policies.ts` | The rules: the innermost provider wins, Replay is kept in sync with it, buffers are sent on errors and on leave. No React. |
| `src/components/session-replay-provider.tsx` | The React part: `<SessionReplayProvider>` and `useSessionReplay()`. |
| `src/components/replay-debug-badge.tsx` | Optional, for development: shows what Replay is doing right now. |

1. Add `replayIntegration()` to `Sentry.init` with both replay sample rates
   at 0.
2. Copy `src/lib/replay/policies.ts` and
   `src/components/session-replay-provider.tsx`.
3. Wrap the parts of your app you care about in `<SessionReplayProvider>`.
   Anything outside one isn't recorded, unless you put a default provider
   in your root layout.

Not on Next.js? Change the `@sentry/nextjs` imports to `@sentry/react` (or
`@sentry/browser` for `policies.ts`). Nothing else in those files is
Next.js-specific.

`sendOnLeave` only fires when someone navigates elsewhere inside your app.
Closing the tab, refreshing, or typing another URL never unmounts the
provider, so that buffer isn't sent.

## Try it on `main`

1. Browse `/events`: the badge says not recording.
2. Open an event: buffering. Double-click **RSVP** and the error sends the
   buffer, so the badge switches to recording.
3. With **Beta features** off, open **Submit a talk**: buffering. On step 3,
   paste an abstract over 600 characters and click **Next** (nothing
   happens), then leave via **Events**. That replay is sent; a completed
   submission isn't.
4. Turn on **Beta features** and open **Submit a talk**: recording.
5. In Sentry, chart `submit_funnel` by `step`, and filter issues and
   replays by the `replay.policy` tag or the `ai-abstract-helper` flag.

Replays shorter than 5 seconds are dropped, so stay a moment on each page.

The three bugs planted in the app (and how replay finds each one) are in
[`docs/FACILITATOR.md`](docs/FACILITATOR.md).

## Further reading

- [Customize Session Replay sampling with a hook](https://sentry.io/cookbook/customize-session-replay-sampling-hook/):
  the simpler version of `<SessionReplayProvider>` (same names, too). It
  keeps `replaysOnErrorSampleRate` at `1.0` and drops back to buffering
  when the provider unmounts, so every page buffers. This repo sets both
  rates to 0 and tags errors with the buffered replay itself, so pages
  outside a provider record nothing (see `docs/FACILITATOR.md`).
- [Understanding sessions](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/understanding-sessions/):
  manual `start()`, `startBuffering()`, `stop()` and `flush()`.
