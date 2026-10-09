"use client";

import { useState } from "react";
import { toggleRsvp } from "@/app/actions";
import type { RsvpStatus } from "@/lib/data";

export function RsvpButton({
  eventId,
  initialStatus,
  initialCount,
  capacity,
}: {
  eventId: string;
  initialStatus: RsvpStatus;
  initialCount: number;
  capacity: number;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);

  async function onClick() {
    setSaving(true);
    const result = await toggleRsvp(eventId, status);
    setSaving(false);

    if (!result.ok) {
      throw new Error(
        `RSVP conflict for ${eventId}: client thought "${status}", server has "${result.status}"`,
      );
    }
    setStatus(result.status);
    setCount(result.count);
  }

  const going = status === "going";

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink/60">
        <span className="font-display font-semibold tracking-tight text-3xl text-ink">{count}</span> / {capacity} going
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full bg-moss transition-all" style={{ width: `${Math.min(100, (count / capacity) * 100)}%` }} />
      </div>
      <button onClick={onClick} className={`btn w-full ${going ? "btn-ghost" : "btn-brand"}`}>
        {saving ? "Saving…" : going ? "✓ You're going (cancel)" : "RSVP"}
      </button>
      <p className="text-xs text-ink/40">Free. Cancel anytime.</p>
    </div>
  );
}
