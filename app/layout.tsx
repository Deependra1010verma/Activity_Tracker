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
            <Link href="/" className="brand-mark">
              Recall Ledger ✨
            </Link>
            <div className="auth-controls" id="header-auth-controls">
              {/* Client components will render auth state here if needed, or we just keep it minimal */}
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
