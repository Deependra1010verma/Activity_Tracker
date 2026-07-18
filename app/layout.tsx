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
              <h1>Your learning should stay.</h1>
              <p className="muted">
                Capture what you learned today and bring it back before your
                brain forgets it.
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
                Auth
              </Link>
              <Link className="nav-pill" href="/onboarding">
                Onboarding
              </Link>
              <Link className="nav-pill" href="/setup">
                Multi-user setup
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
