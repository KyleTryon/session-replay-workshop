import Link from "next/link";
import type { Event } from "@/lib/data";
import { formatDate } from "@/lib/format";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="card block transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">{formatDate(event.date)}</p>
      <h3 className="mt-1 font-display font-semibold tracking-tight text-xl">{event.title}</h3>
      <p className="mt-1 text-sm text-ink/60">
        {event.venue} · {event.neighborhood}
      </p>
      <p className="mt-3 text-sm text-ink/80 line-clamp-2">{event.blurb}</p>
      <div className="mt-3 flex gap-2">
        {event.tags.map((t) => (
          <span key={t} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/70">#{t}</span>
        ))}
      </div>
    </Link>
  );
}
