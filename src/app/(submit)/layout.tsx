// Section: submit
// Talk submission wizard. The funnel we actually want to watch.
//
// Policy: 10% of visitors, plus 100% of anyone with the
// `ai-abstract-helper` flag on. The flag lives in client-side OpenFeature,
// so the decision happens in a client component.

import { SubmitReplayProvider } from "@/components/submit-replay-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SubmitReplayProvider>{children}</SubmitReplayProvider>;
}
