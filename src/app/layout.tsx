import type { Metadata } from "next";
import { Outfit, Fuzzy_Bubbles } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

// Original-Schriften von hundsgescheit.de: Outfit für Text UND Überschriften (gemischte
// Schreibung, bold), Fuzzy Bubbles als Handschrift-Akzent.
const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const heading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});
const hand = Fuzzy_Bubbles({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: { default: s.metaTitleDefault, template: `%s · ${s.siteName}` },
    description: s.metaDescriptionDefault,
    openGraph: { type: "website", locale: "de_DE", siteName: s.siteName },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${body.variable} ${heading.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
