"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

type Status = { mode: "off" | "buffer" | "session"; id?: string };

function read(): Status {
  const replay = Sentry.getReplay();
  const mode = replay?.getRecordingMode();
  return mode ? { mode, id: replay?.getReplayId() } : { mode: "off" };
}

const STYLES: Record<Status["mode"], string> = {
  session: "bg-red-600 text-white",
  buffer: "bg-amber-400 text-ink",
  off: "bg-ink/80 text-paper",
};

const LABELS: Record<Status["mode"], string> = {
  session: "● REC session",
  buffer: "◐ buffering",
  off: "○ not recording",
};

/** Workshop helper: shows what Session Replay is doing right now. */
export function ReplayDebugBadge() {
  const [status, setStatus] = useState<Status>({ mode: "off" });

  useEffect(() => {
    const update = () => setStatus(read());
    update();
    const client = Sentry.getClient();
    if (!client) return;
    const off = [
      client.on("replayStart", update),
      client.on("replayEnd", update),
      // A buffer turns into a session once it finishes uploading after an
      // error. The SDK doesn't announce that, so look again a moment later.
      client.on("afterSendEvent", () => setTimeout(update, 1000)),
    ];
    return () => off.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-full px-3 py-1.5 font-mono text-xs shadow-lg ${STYLES[status.mode]}`}
      title={status.id ? `replay ${status.id}` : undefined}
    >
      {LABELS[status.mode]}
      {status.id && <span className="ml-2 opacity-70">{status.id.slice(0, 8)}</span>}
    </div>
  );
}
