import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with InvestedLuxury. Have a question about luxury fashion, investment pieces, or collaborations? We would love to hear from you.',
  alternates: {
    canonical: 'https://investedluxury.com/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://investedluxury.com/contact',
    siteName: 'InvestedLuxury',
    title: 'Contact | InvestedLuxury',
    description: 'Get in touch with InvestedLuxury. Have a question about luxury fashion, investment pieces, or collaborations? We would love to hear from you.',
    images: [{ url: 'https://investedluxury.com/og-image.jpg', width: 1200, height: 630, alt: 'InvestedLuxury' }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
