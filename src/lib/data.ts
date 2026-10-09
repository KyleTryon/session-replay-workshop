// A tiny in-memory "database". No setup, no Docker, resets when the dev
// server restarts. Stored on globalThis so hot reloads don't wipe it.

export type Role = "attendee" | "speaker" | "organizer";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

export type Event = {
  id: string;
  title: string;
  date: string; // ISO
  venue: string;
  neighborhood: string;
  capacity: number;
  blurb: string;
  tags: string[];
};

export type RsvpStatus = "going" | "not_going";

export type TalkSubmission = {
  id: string;
  userId: string;
  eventId: string;
  speakerName: string;
  speakerEmail: string;
  title: string;
  format: "lightning" | "demo" | "talk";
  abstract: string;
  submittedAt: string;
};

export const USERS: User[] = [
  { id: "u_ada", name: "Ada Park", email: "ada.park@example.com", phone: "215-555-0142", role: "attendee" },
  { id: "u_sam", name: "Sam Rivera", email: "sam.rivera@example.com", phone: "267-555-0199", role: "speaker" },
  { id: "u_jo", name: "Jo Okafor", email: "jo.okafor@example.com", phone: "215-555-0107", role: "organizer" },
];

export const EVENTS: Event[] = [
  {
    id: "demo-night-nov",
    title: "Community Demo Night",
    date: "2026-11-12T18:30:00-05:00",
    venue: "The Foundry",
    neighborhood: "Fishtown",
    capacity: 80,
    blurb: "Five-minute demos of things people actually built. Side projects, weird hacks, and works in progress welcome.",
    tags: ["demos", "community"],
  },
  {
    id: "react-perf",
    title: "React Performance Clinic",
    date: "2026-11-19T18:00:00-05:00",
    venue: "Hatch Co-working",
    neighborhood: "Old City",
    capacity: 40,
    blurb: "Bring a slow page, leave with a profile and a plan. Pair up with folks who have fixed the same thing before.",
    tags: ["react", "performance"],
  },
  {
    id: "ai-tooling",
    title: "AI Tooling Show & Tell",
    date: "2026-12-03T18:30:00-05:00",
    venue: "Riverside Library, Room B",
    neighborhood: "Northern Liberties",
    capacity: 60,
    blurb: "What's actually working in your editor and terminal. No slides over 10 minutes, no vendor pitches.",
    tags: ["ai", "tooling"],
  },
  {
    id: "first-talk",
    title: "First Talk Friday",
    date: "2026-12-11T17:30:00-05:00",
    venue: "Bean There Cafe",
    neighborhood: "South Philly",
    capacity: 30,
    blurb: "A friendly room for first-time speakers. Give a lightning talk, get kind feedback, eat snacks.",
    tags: ["speaking", "beginners"],
  },
  {
    id: "hardware-hack",
    title: "Hardware Hack Night",
    date: "2027-01-14T18:00:00-05:00",
    venue: "The Make Space",
    neighborhood: "Kensington",
    capacity: 25,
    blurb: "Microcontrollers, soldering irons, and blinking lights. Kits provided for the first 15 people.",
    tags: ["hardware", "iot"],
  },
  {
    id: "devex-roundtable",
    title: "Developer Experience Roundtable",
    date: "2027-01-28T18:30:00-05:00",
    venue: "Hatch Co-working",
    neighborhood: "Old City",
    capacity: 35,
    blurb: "Docs, onboarding, error messages, and SDK ergonomics. An open discussion about what makes tools pleasant.",
    tags: ["devex", "discussion"],
  },
];

type Store = {
  rsvps: Map<string, RsvpStatus>; // key: `${eventId}:${userId}`
  rsvpCounts: Map<string, number>;
  submissions: TalkSubmission[];
};

const globalStore = globalThis as unknown as { __meetupStore?: Store };

function seedCounts() {
  const counts = new Map<string, number>();
  EVENTS.forEach((e, i) => counts.set(e.id, Math.round(e.capacity * (0.35 + (i % 3) * 0.2))));
  return counts;
}

export const store: Store =
  globalStore.__meetupStore ??
  (globalStore.__meetupStore = {
    rsvps: new Map(),
    rsvpCounts: seedCounts(),
    submissions: [
      {
        id: "sub_seed_1",
        userId: "u_sam",
        eventId: "demo-night-nov",
        speakerName: "Sam Rivera",
        speakerEmail: "sam.rivera@example.com",
        title: "I replaced my smart home hub with a $4 microcontroller",
        format: "demo",
        abstract: "A tour of the worst and best decisions I made while ripping out a proprietary hub.",
        submittedAt: "2026-10-01T14:12:00-04:00",
      },
    ],
  });

export function getEvent(id: string) {
  return EVENTS.find((e) => e.id === id);
}

export function getUser(id: string | undefined) {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

export function getRsvp(eventId: string, userId: string): RsvpStatus {
  return store.rsvps.get(`${eventId}:${userId}`) ?? "not_going";
}

export function getAttendeeCount(eventId: string) {
  return store.rsvpCounts.get(eventId) ?? 0;
}

/** Fake attendee list for the organizer dashboard. Deliberately full of PII. */
export function getAttendees(eventId: string) {
  const first = ["Maya", "Luis", "Priya", "Tom", "Keisha", "Wei", "Dana", "Omar", "Grace", "Nico"];
  const last = ["Chen", "Diaz", "Patel", "Murphy", "Brooks", "Zhang", "Kim", "Haddad", "Lee", "Rossi"];
  const n = Math.min(getAttendeeCount(eventId), 10);
  return Array.from({ length: n }, (_, i) => {
    const name = `${first[i]} ${last[(i * 3) % last.length]}`;
    return {
      name,
      email: `${first[i].toLowerCase()}.${last[(i * 3) % last.length].toLowerCase()}@example.com`,
      phone: `215-555-01${String(10 + i * 7).padStart(2, "0")}`,
      dietary: ["none", "vegetarian", "vegan", "gluten-free", "none"][i % 5],
    };
  });
}
