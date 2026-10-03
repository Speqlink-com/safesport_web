import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/theme_switcher";

export const metadata = {
  title: "Privacy Notice — SafeSport™",
  description:
    "How AYOT SafeSport™ handles athlete, health and platform information.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <Link href="/account/signin">
            <Logo />
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Privacy Notice
            </span>
            <ThemeSwitcher />
            <Link
              href="/account/signin"
              className="text-sm text-primary hover:underline underline-offset-2"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 AYOT Health Solutions Limited. All rights reserved.</span>
          <Link
            href="/privacy"
            className="hover:underline underline-offset-2"
          >
            Privacy Notice
          </Link>
        </div>
      </footer>
    </div>
  );
}
