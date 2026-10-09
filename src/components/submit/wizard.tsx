"use client";

import { useBooleanFlagValue } from "@openfeature/react-sdk";
import Link from "next/link";
import { useState } from "react";
import { submitTalk } from "@/app/actions";
import { draftAbstract } from "@/lib/abstract-helper";
import { FLAGS } from "@/lib/flags";
import { ABSTRACT_LIMIT, AUDIENCES, FORMATS, type TalkDraft, validateStep } from "@/lib/talk";

const STEPS = ["About you", "Your talk", "Abstract", "Review"];

export function SubmitWizard({
  events,
  initial,
}: {
  events: { id: string; title: string }[];
  initial: Pick<TalkDraft, "eventId" | "speakerName" | "speakerEmail">;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<TalkDraft>({
    ...initial,
    title: "",
    format: "lightning",
    audience: "",
    abstract: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const aiHelper = useBooleanFlagValue(FLAGS.aiAbstractHelper, false);

  const update = <K extends keyof TalkDraft>(key: K, value: TalkDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function next() {
    if (!validateStep(step, draft)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setSubmitting(true);
    const { id } = await submitTalk({
      eventId: draft.eventId,
      speakerName: draft.speakerName,
      speakerEmail: draft.speakerEmail,
      title: draft.title,
      format: draft.format,
      abstract: draft.abstract,
    });
    setSubmittedId(id);
    setSubmitting(false);
  }

  if (submittedId) {
    return (
      <div className="card mt-8 text-center">
        <p className="text-4xl">🎤</p>
        <h2 className="mt-2 font-display font-semibold tracking-tight text-2xl">Submitted!</h2>
        <p className="mt-1 text-ink/60">We&apos;ll be in touch. Reference: {submittedId}</p>
        <Link href="/events" className="btn mt-4">Back to events</Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ol className="mb-6 flex gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 border-t-4 pt-2 text-xs ${i <= step ? "border-brand text-ink" : "border-ink/10 text-ink/40"}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="card space-y-5">
        {step === 0 && (
          <>
            <div>
              <label className="label" htmlFor="speakerName">Name</label>
              <input id="speakerName" className="field" value={draft.speakerName} onChange={(e) => update("speakerName", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="speakerEmail">Email</label>
              <input id="speakerEmail" type="email" className="field" value={draft.speakerEmail} onChange={(e) => update("speakerEmail", e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label" htmlFor="eventId">Which event?</label>
              <select id="eventId" className="field" value={draft.eventId} onChange={(e) => update("eventId", e.target.value)}>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="title">Talk title</label>
              <input id="title" className="field" placeholder="I replaced my build tool and lived" value={draft.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <fieldset>
              <legend className="label">Format</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {FORMATS.map((f) => (
                  <label key={f.value} className={`cursor-pointer rounded-lg border p-3 text-sm ${draft.format === f.value ? "border-brand bg-brand/5" : "border-ink/15"}`}>
                    <input type="radio" name="format" className="sr-only" checked={draft.format === f.value} onChange={() => update("format", f.value)} />
                    <span className="font-medium">{f.label}</span>
                    <span className="block text-xs text-ink/60">{f.detail}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label className="label" htmlFor="audience">Who is it for? <span className="font-normal text-ink/40">(optional)</span></label>
              <select id="audience" className="field" value={draft.audience} onChange={(e) => update("audience", e.target.value)}>
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label mb-0" htmlFor="abstract">Abstract</label>
              {aiHelper && (
                <button
                  type="button"
                  className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss hover:bg-moss/20"
                  onClick={() => update("abstract", draftAbstract(draft))}
                >
                  ✨ Draft it for me <span className="ml-1 rounded bg-moss px-1 text-[10px] text-white">BETA</span>
                </button>
              )}
            </div>
            <textarea
              id="abstract"
              rows={8}
              className="field"
              placeholder="What will people learn? Why should they care?"
              value={draft.abstract}
              onChange={(e) => update("abstract", e.target.value)}
            />
            <p className="mt-1 text-right text-xs text-ink/50">
              {draft.abstract.length} / {ABSTRACT_LIMIT}
            </p>
          </div>
        )}

        {step === 3 && (
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-ink/50">Speaker</dt>
            <dd>{draft.speakerName} ({draft.speakerEmail})</dd>
            <dt className="text-ink/50">Event</dt>
            <dd>{events.find((e) => e.id === draft.eventId)?.title}</dd>
            <dt className="text-ink/50">Title</dt>
            <dd className="font-medium">{draft.title}</dd>
            <dt className="text-ink/50">Format</dt>
            <dd>{FORMATS.find((f) => f.value === draft.format)?.label}</dd>
            <dt className="text-ink/50">Abstract</dt>
            <dd className="whitespace-pre-wrap">{draft.abstract}</dd>
          </dl>
        )}

        <div className="flex justify-between border-t border-ink/10 pt-4">
          <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn" onClick={next}>Next</button>
          ) : (
            <button type="button" className="btn btn-brand" disabled={submitting} onClick={submit}>
              {submitting ? "Submitting…" : "Submit talk"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
