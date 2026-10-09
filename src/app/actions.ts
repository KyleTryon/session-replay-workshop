"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getEvent, store, type RsvpStatus, type TalkSubmission } from "@/lib/data";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function switchUser(uid: string) {
  (await cookies()).set("uid", uid, { path: "/" });
  revalidatePath("/", "layout");
}

export async function setBeta(enabled: boolean) {
  (await cookies()).set("beta", enabled ? "1" : "0", { path: "/" });
  revalidatePath("/", "layout");
}

export type RsvpResult =
  | { ok: true; status: RsvpStatus; count: number }
  | { ok: false; reason: "conflict"; status: RsvpStatus; count: number };

/**
 * Toggle an RSVP. The client sends the status it *thinks* is current so the
 * server can detect stale writes.
 */
export async function toggleRsvp(eventId: string, expected: RsvpStatus): Promise<RsvpResult> {
  const { user } = await getSession();
  const event = getEvent(eventId);
  if (!event) throw new Error(`Unknown event ${eventId}`);

  // Pretend this is a slow network/database round trip.
  await sleep(700);

  const key = `${eventId}:${user.id}`;
  const current = store.rsvps.get(key) ?? "not_going";
  const count = store.rsvpCounts.get(eventId) ?? 0;

  if (current !== expected) {
    return { ok: false, reason: "conflict", status: current, count };
  }

  const next: RsvpStatus = current === "going" ? "not_going" : "going";
  const nextCount = count + (next === "going" ? 1 : -1);
  store.rsvps.set(key, next);
  store.rsvpCounts.set(eventId, nextCount);
  revalidatePath(`/events/${eventId}`);
  return { ok: true, status: next, count: nextCount };
}

export async function submitTalk(
  input: Omit<TalkSubmission, "id" | "userId" | "submittedAt">,
): Promise<{ id: string }> {
  const { user } = await getSession();
  await sleep(500);
  const submission: TalkSubmission = {
    ...input,
    id: `sub_${Date.now().toString(36)}`,
    userId: user.id,
    submittedAt: new Date().toISOString(),
  };
  store.submissions.push(submission);
  revalidatePath("/admin");
  return { id: submission.id };
}

export async function saveProfile(form: FormData) {
  await sleep(400);
  // Nothing is persisted. This page exists to show what *shouldn't* be recorded.
  void form;
}
