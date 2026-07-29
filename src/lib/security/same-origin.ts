export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin === new URL(request.url).origin;
  }

  return request.headers.get("sec-fetch-site") === "same-origin";
}
