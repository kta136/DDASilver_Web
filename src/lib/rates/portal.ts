const LOCAL_RATES_FALLBACK = "/rates";

export function resolveRatesPortalUrl(
  value = process.env.NEXT_PUBLIC_RATES_PORTAL_URL,
) {
  if (!value) {
    return LOCAL_RATES_FALLBACK;
  }

  try {
    const url = new URL(value);
    const allowedHost =
      url.hostname === "ddajewels.com" ||
      url.hostname.endsWith(".ddajewels.com");
    const allowedPath =
      url.pathname === "/silver-rates" ||
      url.pathname === "/silver-rates/";

    if (
      url.protocol !== "https:" ||
      !allowedHost ||
      !allowedPath ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return LOCAL_RATES_FALLBACK;
    }

    return url.toString();
  } catch {
    return LOCAL_RATES_FALLBACK;
  }
}
