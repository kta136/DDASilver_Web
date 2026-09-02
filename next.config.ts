import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isProductionSite = process.env.NEXT_PUBLIC_SITE_ENV === "production";
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

const correctedPlateSlugs = [
  "mini-concentric-line-silver",
  "compact-concentric-line-silver",
  "medium-concentric-line-silver",
  "deep-concentric-line-silver",
  "wide-concentric-line-silver",
  "large-concentric-line-silver",
  "grand-concentric-line-silver",
  "extra-large-concentric-line-silver",
  "eleven-inch-concentric-line-silver",
  "twelve-inch-concentric-line-silver",
  "thirteen-inch-concentric-line-silver",
] as const;

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://cdn.sanity.io https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://www.google-analytics.com https://cloudflareinsights.com",
  "frame-src 'self' https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [384, 640, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 192, 256],
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
      ...["/api/auth/:path*", "/auth/:path*", "/studio/:path*"].map(
        (source) => ({
          source,
          headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        }),
      ),
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ddasilver.com" }],
        destination: "https://www.ddasilver.com/:path*",
        permanent: true,
      },
      ...correctedPlateSlugs.map((slug) => ({
        source: `/products/${slug}-bowl`,
        destination: `/products/${slug}-plate`,
        permanent: true,
      })),
      ...(process.env.ENABLE_LEGACY_REDIRECTS === "true"
        ? [
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
          ]
        : []),
    ];
  },
};

export default nextConfig;
