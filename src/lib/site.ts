const googleBusinessUrl =
  process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL ||
  "https://maps.app.goo.gl/MtSbKmvTjxZHNxdZ7";

export const siteConfig = {
  name: "DDA Silver",
  description:
    "Discover silver jewellery, coins, pooja pieces, gifts, and homeware at DDA Silver in Agra.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "0562-4099980",
  phoneHref: "tel:+915624099980",
  whatsappDisplay: "+91 7060001491",
  whatsappNumber: "917060001491",
  address: "MG Road, opposite Nagar Nigam, Agra, Uttar Pradesh 282002",
  postalCode: "282002",
  // Place coordinates from the official Maps profile, not its camera position.
  coordinates: { latitude: 27.2032231, longitude: 78.0046043 },
  hours: "Tuesday–Sunday, 12:00–20:00",
  mapUrl: googleBusinessUrl,
  googleBusinessUrl,
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.BING_SITE_VERIFICATION,
  androidUrl: "https://play.google.com/store/apps/details?id=lmx.dda.bullion",
  iosUrl: "https://apps.apple.com/in/app/dda-silver/id1565809906",
  sisterBrandUrl: "https://ddajewels.com",
  tvUrl: "https://ddajewels.com/tv",
} as const;

export const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === "production";
