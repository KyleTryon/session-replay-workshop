# Facilitator notes (spoilers)

> Following along live? Save this file for after the workshop: it gives
> away the planted bugs.

Three bugs are planted in the app. None of them are obvious from a stack
trace alone, which is the point: replay is how you find them.

## 1. RSVP double-click race (`/events/[id]`)

`src/components/rsvp-button.tsx` never disables the button while the
request is in flight, and each click sends the status the client *thinks*
is current. Double-click "RSVP" and the second request is stale, the server
answers with a conflict, and the client throws:

> RSVP conflict for react-perf: client thought "not_going", server has "going"

The user sees a button that flickers and "didn't work". The error alone
looks impossible. The replay shows the double-click.

Caught by: **buffer mode** (branch `03-buffer`).
Fix: disable the button while `saving`, or use `useTransition`.

## 2. Abstract silently rejected (`/submit`, step 3)

The counter says `/ 1000` (`ABSTRACT_LIMIT` in `src/lib/talk.ts`), but
`validateStep` only allows 600 characters. Paste a long abstract and the
Next button does nothing. No error, no message, no event in Sentry.

Caught by: **session mode** on the submit page (branch `02-providers`).
This is the "you'd never find this without watching" case, and the
argument for recording 100% of a high-value funnel. In `06-funnels` it's
caught more cheaply: the `submit_funnel` metric drops at "Abstract", and
regular visitors who leave mid-funnel send their last ~60 seconds, so the
replays behind that drop are waiting.
Fix: use `ABSTRACT_LIMIT` in the validator and show validation messages.

## 3. Beta helper crashes without an audience (`/submit`, step 3, Beta on)

Turn on **Beta features** in the header. Step 3 shows "✨ Draft it for me".
If the optional "Who is it for?" field on step 2 was left as "Anyone"
(`""`), `draftAbstract` looks up `TONE[""]`, gets `undefined`, and throws:

> Cannot read properties of undefined (reading 'opener')

Only beta users can hit it. Filter issues/replays by the
`ai-abstract-helper` flag to find the cohort.

Caught by: **flag-gated recording** (branch `04-flags`).
Fix: fall back to a default tone.

## Suggested flow

1. **`01-naive`**: click around the landing page and settings. Show how many
   replays land in Sentry that nobody will ever watch. Do the math on quota.
2. **`02-providers`**: walk through `<SessionReplayProvider>` and
   `policies.ts`. Sample rates at init are global; per-section decisions need
   manual `start()` / `stop()`. The root layout sets an app-wide default
   (10% of sessions) that sections override, and `/admin` has no provider,
   so it inherits it. Reproduce bug #2 and watch it in a replay.
3. **`03-buffer`**: reproduce bug #1. Only that session sends a replay, and it
   includes the 60 seconds before the error.
4. **`04-flags`**: the new feature gets a higher rate than stable code.
   Toggle Beta on, reproduce bug #3, show the flag on the issue, and filter
   replays by the beta cohort.
5. **`05-privacy`**: compare a replay of `/admin` before and after. Talk about
   whether some sections should ever be recorded.
6. **`06-funnels`**: with Beta off, reproduce bug #2 and leave. Chart
   `submit_funnel` by `step`, find the drop at "Abstract", and open the
   replay behind it. Then submit a talk successfully to show that people
   who finish aren't sent.

## Gotchas worth calling out (all hit while building this)

- **Replays under 5 seconds are dropped.** `minReplayDuration` defaults to
  ~5s, so a quick hop through a recorded page won't show up in Sentry. Not
  a bug in the provider logic.
- **`stop()` is async.** Calling `start()` before it resolves leaves you
  with nothing recording, because stop's cleanup tears down the new
  session. That's why `policies.ts` runs every change one at a time. The
  [sampling hook cookbook](https://sentry.io/cookbook/customize-session-replay-sampling-hook/)
  calls `stop()` and then `start()` without awaiting, so expect this
  question if anyone has read it.
- **`replaysOnErrorSampleRate: 0` disables flush-on-error, even in buffer
  mode.** With both rates at 0 the SDK never tags an error with the
  buffered replay's ID, and it only flushes the buffer for tagged errors.
  So `policies.ts` adds the `replayId` tag in a `preprocessEvent` hook and
  lets the SDK flush once the error has actually been sent. The
  alternative (setting the error rate above 0) makes the SDK start
  buffering on every page at init, which is exactly what the providers
  avoid.
- **Replays end after 15 minutes idle or 60 minutes total.** The SDK then
  re-samples, which with both rates at 0 means nothing records again. So
  `policies.ts` listens for `replayEnd` with reason `sessionExpired` and
  applies the current policy again.
- **React mounts everything twice in development.** A provider is removed
  and re-added straight away, so `sendOnLeave` checks whether the provider
  is really gone only when its queued task runs, not on unmount.
- **The hook can't be overridden from inside.** `useSessionReplay()`
  overrides the provider around it, but hooks can't provide context, so
  nothing nested inside that component can override it. Use the provider
  when you need that.
- **`unmask` on a container unmasks inputs too.** The text and input
  selectors are shared. In `05-privacy` the wizard card is re-masked with
  `data-sentry-mask` and only the labels and buttons are unmasked.
- **There's no default `unmask` selector.** `.sentry-unmask` does nothing
  unless you configure it. `mask`, `block`, and `ignore` do have defaults.
