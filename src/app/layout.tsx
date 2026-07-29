import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";

import { AnalyticsEvents } from "@/components/consent/analytics-events";
import { AnalyticsGate } from "@/components/consent/analytics-gate";
import { ConsentManager } from "@/components/consent/consent-manager";
import { isProductionSite, siteConfig } from "@/lib/site";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "DDA Silver | Silver jewellery, gifts & live rates in Agra",
    template: "%s | DDA Silver",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "DDA Silver",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "DDA Silver",
    description: siteConfig.description,
  },
  robots: {
    index: isProductionSite,
    follow: isProductionSite,
    googleBot: {
      index: isProductionSite,
      follow: isProductionSite,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f3",
  colorScheme: "light",
};

const consentDefaults = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });
`;

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: siteConfig.name,
  url: siteConfig.url,
  telephone: siteConfig.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    streetAddress: "MG Road, opposite Nagar Nigam",
    addressLocality: "Agra",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "12:00",
      closes: "20:00",
    },
  ],
  sameAs: [siteConfig.sisterBrandUrl],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script id="dda-consent-default" strategy="beforeInteractive">
          {consentDefaults}
        </Script>
        <Script
          id="dda-local-business"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(localBusinessSchema)}
        </Script>
        {children}
        <ConsentManager />
        <AnalyticsGate gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
