import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Starfield } from "@/components/layout/starfield";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nostr Campaign — Satoshi Galaxy Platform",
    template: "%s · Nostr Campaign",
  },
  description:
    "Run automated, contextual promotional campaigns on Nostr. Discover relevant users, send zaps, and publish AI-crafted comments — all from one B2B control panel.",
  applicationName: "Nostr Campaign",
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Starfield />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
