"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { setBeta, switchUser } from "@/app/actions";
import type { User } from "@/lib/data";

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/submit", label: "Submit a talk" },
  { href: "/account", label: "Account" },
  { href: "/admin", label: "Organizer" },
];

export function SiteHeader({ user, users, beta }: { user: User; users: User[]; beta: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [betaOn, setBetaOn] = useOptimistic(beta);

  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="font-display font-semibold text-xl tracking-tight">
          <span className="text-brand">●</span> Meetup<span className="text-ink/40">.local</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={pathname.startsWith(n.href) ? "font-semibold text-ink" : "text-ink/60 hover:text-ink"}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={`ml-auto flex items-center gap-3 text-sm ${pending ? "opacity-50" : ""}`}>
          <label className="flex items-center gap-1.5 text-ink/70">
            <input
              type="checkbox"
              checked={betaOn}
              onChange={(e) =>
                startTransition(async () => {
                  setBetaOn(e.target.checked);
                  await setBeta(e.target.checked);
                  router.refresh();
                })
              }
            />
            Beta features
          </label>
          <select
            aria-label="Signed in as"
            className="rounded-md border border-ink/15 bg-white px-2 py-1"
            value={user.id}
            onChange={(e) =>
              startTransition(async () => {
                await switchUser(e.target.value);
                router.refresh();
              })
            }
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
