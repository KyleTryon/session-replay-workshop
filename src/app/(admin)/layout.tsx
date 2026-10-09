// Section: admin
// Organizer dashboard. Attendee PII everywhere.
//
// Policy: no provider of its own, so it inherits the app default from the root
// layout (10% of sessions). The attendee table is blocked outright on the
// page; everything else is masked.

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
