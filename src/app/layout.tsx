import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Raporti - Lajme të Shpejta në Shqip",
    template: "%s | Raporti",
  },
  description:
    "Platforma juaj e besueshme për lajme të shpejta dhe të sakta në gjuhën shqipe. Lajme nga bota, politika, konfliktet, ekonomia dhe më shumë.",
  keywords: [
    "lajme", "shqip", "albania", "news", "raporti",
    "lajme shqip", "lajme bote", "politike", "konflikt",
  ],
  authors: [{ name: "Raporti" }],
  openGraph: {
    type: "website",
    locale: "sq_AL",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://raporti.info",
    siteName: "Raporti",
    title: "Raporti - Lajme të Shpejta në Shqip",
    description: "Platforma juaj e besueshme për lajme të shpejta dhe të sakta në gjuhën shqipe.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raporti - Lajme të Shpejta në Shqip",
    description: "Platforma juaj e besueshme për lajme të shpejta dhe të sakta në gjuhën shqipe.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
