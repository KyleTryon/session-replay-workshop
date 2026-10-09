import { EventCard } from "@/components/event-card";
import { EVENTS } from "@/lib/data";

export default function EventsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display font-semibold tracking-tight text-4xl">All events</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {EVENTS.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
