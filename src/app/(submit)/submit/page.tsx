import { SubmitWizard } from "@/components/submit/wizard";
import { EVENTS } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function SubmitPage({ searchParams }: PageProps<"/submit">) {
  const { user } = await getSession();
  const { event } = await searchParams;

  return (
    <div data-sentry-unmask className="mx-auto max-w-2xl">
      <h1 className="font-display font-semibold tracking-tight text-4xl">Submit a talk</h1>
      <p className="mt-2 text-ink/60">Four quick steps. Lightning talks and first-timers are very welcome.</p>
      <SubmitWizard
        events={EVENTS.map((e) => ({ id: e.id, title: e.title }))}
        initial={{
          eventId: typeof event === "string" ? event : EVENTS[0].id,
          speakerName: user.name,
          speakerEmail: user.email,
        }}
      />
    </div>
  );
}
