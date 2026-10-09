export const ABSTRACT_LIMIT = 1000;

export const FORMATS = [
  { value: "lightning", label: "Lightning talk", detail: "5 minutes, no Q&A" },
  { value: "demo", label: "Live demo", detail: "10 minutes, show the thing" },
  { value: "talk", label: "Full talk", detail: "20 minutes + Q&A" },
] as const;

export const AUDIENCES = [
  { value: "", label: "Anyone" },
  { value: "beginner", label: "New to the topic" },
  { value: "practitioner", label: "Uses it day to day" },
  { value: "expert", label: "Deep in the weeds" },
] as const;

export type TalkDraft = {
  eventId: string;
  speakerName: string;
  speakerEmail: string;
  title: string;
  format: "lightning" | "demo" | "talk";
  audience: string;
  abstract: string;
};

export function validateStep(step: number, d: TalkDraft): boolean {
  switch (step) {
    case 0:
      return d.speakerName.trim().length > 1 && /.+@.+\..+/.test(d.speakerEmail);
    case 1:
      return d.title.trim().length >= 5 && !!d.eventId;
    case 2:
      return d.abstract.trim().length >= 40 && d.abstract.length <= 600;
    default:
      return true;
  }
}
