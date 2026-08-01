import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === "production";
const sanityProjectId = /^[a-z0-9-]+$/.test(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
)
  ? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  : null;
const sanityDataset = /^[a-z0-9_-]+$/.test(
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
)
  ? process.env.NEXT_PUBLIC_SANITY_DATASET
  : null;

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://cdn.sanity.io https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://www.google-analytics.com",
  "frame-src 'self' https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns:
      sanityProjectId && sanityDataset
        ? [
            {
              protocol: "https",
              hostname: "cdn.sanity.io",
              pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
            },
          ]
        : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          ...(isProductionSite
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          ...(!isProductionSite
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    if (process.env.ENABLE_LEGACY_REDIRECTS !== "true") {
      return [];
    }

    return [
      {
        source: "/index.php/c_booking/index",
        destination: "/rates",
        permanent: true,
      },
      {
        source: "/index.php/c_client_main/Contactus",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
