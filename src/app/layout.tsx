import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/ComingSoon";

const siteUrl = "https://investedluxury.com";

export const metadata: Metadata = {
  title: {
    default: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    template: "%s | InvestedLuxury",
  },
  description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle. Expert guides, reviews, and curated recommendations for the discerning collector.",
  keywords: ["luxury fashion", "investment pieces", "quiet luxury", "designer bags", "luxury watches", "jewelry", "luxury lifestyle", "The Row", "Hermès", "luxury investment"],
  authors: [{ name: "InvestedLuxury" }],
  creator: "InvestedLuxury",
  publisher: "InvestedLuxury",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "InvestedLuxury",
    title: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "InvestedLuxury - Curated Luxury Fashion & Lifestyle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestedLuxury | Curated Luxury Fashion & Lifestyle",
    description: "Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.",
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@investedluxury",
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
  verification: {
    google: "VS78qLoOgzpQlQPerPbiu0CGU-3mfIOtURsceRrABAs",
  },
};

// JSON-LD Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "InvestedLuxury",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [
    "https://instagram.com/investedluxury",
    "https://pinterest.com/investedluxury",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@investedluxury.com",
  },
};

// JSON-LD WebSite Schema (for sitelinks search)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "InvestedLuxury",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1KKR1BB7GW"
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
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ComingSoon />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}