import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://mypropertyconnect.ng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyPropertyConnect — List free. Find fast. Deal smart.",
    template: "%s | MyPropertyConnect NG",
  },
  description:
    "Nigeria's verified real estate platform. Every agent ID-checked, every listing screened for scams. Eight property categories across all 36 states and the FCT. Free to list, forever.",
  keywords: [
    "Nigerian real estate",
    "property for sale Lagos",
    "houses for rent Nigeria",
    "free property listing Nigeria",
    "verified estate agent Nigeria",
    "short let Lagos",
    "property in Abuja",
    "land for sale Nigeria",
    "commercial property Nigeria",
  ],
  openGraph: {
    type: "website",
    siteName: "MyPropertyConnect NG",
    title: "MyPropertyConnect — List free. Find fast. Deal smart.",
    description:
      "Nigeria's verified real estate platform. Every agent ID-checked, every listing screened. Free to list, forever.",
    locale: "en_NG",
    url: SITE_URL,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "MyPropertyConnect — List free. Find fast. Deal smart." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyPropertyConnect — List free. Find fast. Deal smart.",
    description:
      "Nigeria's verified real estate platform. Every agent ID-checked, every listing screened for scams. Free to list, forever.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Google Search Console → Settings → Ownership verification → HTML tag →
  // paste just the content="..." value into NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
