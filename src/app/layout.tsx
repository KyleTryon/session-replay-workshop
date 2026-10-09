import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FlagsProvider } from "@/components/flags-provider";
import { ReplayDebugBadge } from "@/components/replay-debug-badge";
import { SiteHeader } from "@/components/site-header";
import { USERS } from "@/lib/data";
import { getSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meetup.local",
  description: "A demo meetup app for the Session Replay workshop",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { user, beta } = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <FlagsProvider userId={user.id} role={user.role} beta={beta}>
          <SiteHeader user={user} users={USERS} beta={beta} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-ink/40">
            Demo app for the &ldquo;Record what matters&rdquo; Session Replay workshop. All data is fake.
          </footer>
          <ReplayDebugBadge />
        </FlagsProvider>
      </body>
    </html>
  );
}
