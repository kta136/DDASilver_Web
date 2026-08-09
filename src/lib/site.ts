export const siteConfig = {
  name: "DDA Silver",
  description:
    "Discover silver jewellery, coins, pooja pieces, gifts, and homeware at DDA Silver in Agra.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "0562-4100044",
  phoneHref: "tel:+915624100044",
  whatsappDisplay: "+91 7060001491",
  whatsappNumber: "917060001491",
  address: "MG Road, opposite Nagar Nigam, Agra",
  hours: "Tuesday–Sunday, 12:00–20:00",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=DDA+Silver%2C+MG+Road%2C+opposite+Nagar+Nigam%2C+Agra",
  googleBusinessUrl: process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL,
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.BING_SITE_VERIFICATION,
  androidUrl:
    "https://play.google.com/store/apps/details?id=lmx.dda.bullion",
  iosUrl: "https://apps.apple.com/in/app/dda-silver/id1565809906",
  sisterBrandUrl: "https://ddajewels.com",
  tvUrl: "https://ddajewels.com/tv",
} as const;

export const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === "production";
