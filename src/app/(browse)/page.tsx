import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { EVENTS } from "@/lib/data";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="py-8">
        <p className="text-sm uppercase tracking-widest text-brand">Philly tech meetups</p>
        <h1 className="mt-2 font-display font-semibold text-5xl leading-tight tracking-tight max-w-2xl">
          Show up, show what you built, meet the people who build here.
        </h1>
        <div className="mt-6 flex gap-3">
          <Link href="/events" className="btn">Browse events</Link>
          <Link href="/submit" className="btn btn-ghost">Submit a talk</Link>
        </div>
      </section>
      <section>
        <h2 className="mb-4 font-display font-semibold tracking-tight text-2xl">Coming up</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {EVENTS.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
