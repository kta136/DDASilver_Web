import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";

import { AnalyticsEvents } from "@/components/consent/analytics-events";
import { AnalyticsGate } from "@/components/consent/analytics-gate";
import { ConsentManager } from "@/components/consent/consent-manager";
import { isProductionSite, siteConfig } from "@/lib/site";
import { defaultSocialImage, toAbsoluteUrl } from "@/lib/seo";

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
    default: "DDA Silver | Silver Jewellery, Coins & Live Rates in Agra",
    template: "%s | DDA Silver",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Silver jewellery",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: "DDA Silver | Silver Jewellery, Coins & Live Rates in Agra",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: toAbsoluteUrl(defaultSocialImage.src),
        width: defaultSocialImage.width,
        height: defaultSocialImage.height,
        alt: defaultSocialImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DDA Silver | Silver Jewellery, Coins & Live Rates in Agra",
    description: siteConfig.description,
    images: [
      {
        url: toAbsoluteUrl(defaultSocialImage.src),
        alt: defaultSocialImage.alt,
      },
    ],
  },
  robots: {
    index: isProductionSite,
    follow: isProductionSite,
    googleBot: {
      index: isProductionSite,
      follow: isProductionSite,
      ...(isProductionSite
        ? {
            "max-image-preview": "large" as const,
            "max-snippet": -1,
            "max-video-preview": -1,
          }
        : {}),
    },
  },
  verification: siteConfig.googleSiteVerification
    ? { google: siteConfig.googleSiteVerification }
    : undefined,
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

const businessId = `${toAbsoluteUrl("/")}#business`;
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "JewelryStore",
      "@id": businessId,
      name: siteConfig.name,
      description: siteConfig.description,
      url: toAbsoluteUrl("/"),
      logo: toAbsoluteUrl("/brand/dda-family-mark.png"),
      image: toAbsoluteUrl(defaultSocialImage.src),
      telephone: siteConfig.phoneHref.replace("tel:", ""),
      hasMap: siteConfig.mapUrl,
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
      sameAs: siteConfig.googleBusinessUrl
        ? [siteConfig.googleBusinessUrl]
        : undefined,
    },
    {
      "@type": "WebSite",
      "@id": `${toAbsoluteUrl("/")}#website`,
      url: toAbsoluteUrl("/"),
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en-IN",
      publisher: { "@id": businessId },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
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
          {JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c")}
        </Script>
        {children}
        <ConsentManager />
        <AnalyticsGate gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
