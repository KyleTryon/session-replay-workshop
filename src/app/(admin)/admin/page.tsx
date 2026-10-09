import { EVENTS, getAttendees, getEvent, store } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { user } = await getSession();
  if (user.role !== "organizer") {
    return (
      <div className="card mx-auto max-w-md text-center">
        <h1 className="font-display font-semibold tracking-tight text-2xl">Organizers only</h1>
        <p className="mt-2 text-sm text-ink/60">Switch to Jo Okafor (organizer) in the header to see this page.</p>
      </div>
    );
  }

  const { event: eventParam } = await searchParams;
  const event = getEvent(typeof eventParam === "string" ? eventParam : "") ?? EVENTS[0];
  const attendees = getAttendees(event.id);
  const submissions = store.submissions.filter((s) => s.eventId === event.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 data-sentry-unmask className="font-display font-semibold tracking-tight text-4xl">Organizer dashboard</h1>
          <p className="mt-1 text-ink/60">{event.title} · {formatDate(event.date)}</p>
        </div>
        <nav data-sentry-unmask className="flex flex-wrap gap-2 text-sm">
          {EVENTS.map((e) => (
            <Link
              key={e.id}
              href={`/admin?event=${e.id}`}
              className={`rounded-full px-3 py-1 ${e.id === event.id ? "bg-ink text-paper" : "bg-ink/5 hover:bg-ink/10"}`}
            >
              {e.title}
            </Link>
          ))}
        </nav>
      </div>

      <section data-sentry-block className="card overflow-x-auto">
        <h2 className="mb-3 font-display font-semibold tracking-tight text-xl">Attendees ({attendees.length})</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-ink/50">
            <tr><th className="py-1">Name</th><th>Email</th><th>Phone</th><th>Dietary</th></tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.email} className="border-t border-ink/5">
                <td className="py-1.5">{a.name}</td><td>{a.email}</td><td>{a.phone}</td><td>{a.dietary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="mb-3 font-display font-semibold tracking-tight text-xl">Talk submissions ({submissions.length})</h2>
        {submissions.length === 0 && <p className="text-sm text-ink/50">None yet.</p>}
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-lg border border-ink/10 p-3">
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-ink/50">{s.speakerName} · {s.speakerEmail} · {s.format}</p>
              <p className="mt-1 text-sm text-ink/80">{s.abstract}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
