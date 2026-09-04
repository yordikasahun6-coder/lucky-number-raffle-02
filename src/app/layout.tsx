import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";
import HelpWidget from "@/components/HelpWidget";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Lucky Ticket — Your Next Win Could Be Yours",
  description:
    "Pick your lucky number, join the raffle, and see what happens. Simple, secure, and easy to join.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Lucky Ticket — Your Next Win Could Be Yours",
    description:
      "Pick your lucky number, join the raffle, and see what happens. Simple, secure, and easy to join.",
    url: "/",
    siteName: "Lucky Ticket",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Lucky Ticket" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucky Ticket — Your Next Win Could Be Yours",
    description:
      "Pick your lucky number, join the raffle, and see what happens.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${mono.variable} ${manrope.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
          <HelpWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
