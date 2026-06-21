import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "CarbonWise — Track & Reduce Your Carbon Footprint",
  description:
    "Measure, understand, and reduce your everyday CO₂ emissions. Personal carbon tracker with analytics, an AI sustainability coach, goals, and gamification.",
  keywords: ["carbon footprint", "sustainability", "CO2 tracker", "climate"],
  authors: [{ name: "CarbonWise" }],
  manifest: "/manifest.webmanifest",
  openGraph: { title: "CarbonWise", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PwaRegister />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
