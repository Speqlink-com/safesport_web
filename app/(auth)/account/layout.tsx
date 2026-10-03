import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/theme_switcher";

export default function Auth_layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 lg:p-7">
      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-between p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full flex justify-between items-center">
          <Logo />
          <ThemeSwitcher />
        </div>

        <div className="flex items-center justify-center flex-1 w-full py-8">
          {children}
        </div>

        <footer className="w-full text-center text-xs text-muted-foreground mt-8 space-y-1.5">
          <p>
            © 2026 AYOT Health Solutions Limited. All rights reserved.
          </p>
          <p>
            <Link href="/privacy" className="hover:underline underline-offset-2">
              Privacy Notice
            </Link>
            {" · "}
            All athlete health data is encrypted in transit and at rest, and processed in accordance with applicable data protection law.
          </p>
        </footer>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative rounded-4xl overflow-hidden border">
        <Image
          src="/imgs/safe2.png"
          alt="Safe"
          fill
          className="object-cover object-left"
          priority
        />
      </div>
    </div>
  );
}
