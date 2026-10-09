import Link from "next/link";
import { notFound } from "next/navigation";
import { RsvpButton } from "@/components/rsvp-button";
import { getAttendeeCount, getEvent, getRsvp } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const { user } = await getSession();
  const status = getRsvp(event.id, user.id);
  const count = getAttendeeCount(event.id);

  return (
    <article className="grid gap-8 md:grid-cols-[1fr_280px]">
      <div>
        <Link href="/events" className="text-sm text-ink/50 hover:text-ink">← All events</Link>
        <p className="mt-4 text-sm font-medium uppercase tracking-wide text-brand">{formatDate(event.date)}</p>
        <h1 className="mt-1 font-display font-semibold text-5xl tracking-tight">{event.title}</h1>
        <p className="mt-2 text-ink/60">
          {event.venue} · {event.neighborhood}
        </p>
        <p className="mt-6 max-w-prose text-lg leading-relaxed">{event.blurb}</p>
        <div className="mt-8 card max-w-prose">
          <h2 className="font-display font-semibold tracking-tight text-lg">Want to speak?</h2>
          <p className="mt-1 text-sm text-ink/70">
            Lightning talks and demos are always welcome. First-timers especially.
          </p>
          <Link href={`/submit?event=${event.id}`} className="btn btn-ghost mt-3">Submit a talk</Link>
        </div>
      </div>
      <aside className="card h-fit space-y-4">
        <RsvpButton eventId={event.id} initialStatus={status} initialCount={count} capacity={event.capacity} />
      </aside>
    </article>
  );
}
