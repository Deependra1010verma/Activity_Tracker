import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recall Ledger",
  description: "Activity tracker for spaced repetition and active recall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark">Recall Ledger</span>
              <h1>Study once. Keep it alive.</h1>
              <p className="muted">
                Capture what you learned, revisit it beautifully, and make recall feel
                light instead of heavy.
              </p>
            </div>
            <nav className="nav-links" aria-label="Primary">
              <Link className="nav-pill" href="/">
                Dashboard
              </Link>
              <Link className="nav-pill" href="/learn">
                Add learning
              </Link>
              <Link className="nav-pill" href="/review">
                Review queue
              </Link>
              <Link className="nav-pill" href="/auth">
                Login
              </Link>
              <Link className="nav-pill" href="/onboarding">
                Profile
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
