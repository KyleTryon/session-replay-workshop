"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions";
import type { User } from "@/lib/data";

export function ProfileForm({ user }: { user: User }) {
  const [saved, action, pending] = useActionState(async (_prev: boolean, form: FormData) => {
    await saveProfile(form);
    return true;
  }, false);

  return (
    <form action={action} className="card mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="name">Display name</label>
        <input id="name" name="name" className="field" defaultValue={user.name} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="field" defaultValue={user.email} />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone (for day-of updates)</label>
        <input id="phone" name="phone" type="tel" className="field" defaultValue={user.phone} />
      </div>
      <div>
        <label className="label" htmlFor="bio">Short bio</label>
        <textarea id="bio" name="bio" rows={3} className="field" placeholder="Shown on your speaker page" />
      </div>
      <fieldset className="space-y-2">
        <legend className="label">Notifications</legend>
        {["New events near me", "Reminders the day before", "Call for speakers"].map((n, i) => (
          <label key={n} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={`notify-${i}`} defaultChecked={i < 2} /> {n}
          </label>
        ))}
      </fieldset>
      <div className="flex items-center gap-3 border-t border-ink/10 pt-4">
        <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {saved && !pending && <span className="text-sm text-moss">Saved.</span>}
      </div>
    </form>
  );
}
