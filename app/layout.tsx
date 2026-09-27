import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Theme_Provider from "@/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/features/safesport/workspace/store";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthBootstrap } from "@/features/auth/components";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeSport™",
  description: "SafeSport™",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${geistMono.variable} h-full antialiased `}
      suppressHydrationWarning
    >
      <body
        className={`${interSans.className} h-full flex flex-col bg-background`}
      >
        <Theme_Provider>
          <AuthBootstrap />
          <WorkspaceProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </WorkspaceProvider>
          <Toaster />
          <HotToaster position="top-right" toastOptions={{ duration: 4000 }} />
        </Theme_Provider>
      </body>
    </html>
  );
}
