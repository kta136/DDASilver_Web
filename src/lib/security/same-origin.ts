export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return request.headers.get("sec-fetch-site") !== "cross-site";
  }

  return origin === new URL(request.url).origin;
}
