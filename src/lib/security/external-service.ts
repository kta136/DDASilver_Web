export function isAllowedDdaJewelsUrl(value?: string): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    const isDevelopmentLoopback =
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    return (
      isDevelopmentLoopback ||
      (url.protocol === "https:" &&
        (url.hostname === "ddajewels.com" ||
          url.hostname.endsWith(".ddajewels.com")))
    );
  } catch {
    return false;
  }
}

export async function readBoundedJson(
  response: Response,
  maximumBytes = 64_000,
) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new Error("External response is too large");
  }
  const body = await response.text();
  if (Buffer.byteLength(body, "utf8") > maximumBytes) {
    throw new Error("External response is too large");
  }
  return JSON.parse(body) as unknown;
}
