import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    template: "%s | InvestedLuxury",
  },
  description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle. Expert guides, reviews, and curated recommendations for the discerning collector.",
  keywords: ["luxury fashion", "investment pieces", "quiet luxury", "designer bags", "luxury watches", "jewelry", "luxury lifestyle"],
  authors: [{ name: "InvestedLuxury" }],
  creator: "InvestedLuxury",
  publisher: "InvestedLuxury",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://investedluxury.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://investedluxury.com",
    siteName: "InvestedLuxury",
    title: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InvestedLuxury",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.",
    images: ["/og-image.jpg"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
      <head>
        <meta name="google-site-verification" content="VS78qLoOgzpQlQPerPbiu0CGU-3mfIOtURsceRrABAs" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-1KKR1BB7GW`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1KKR1BB7GW');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
