export function ddaJewelsSessionCookieHeader(sessionToken: string) {
  const encoded = encodeURIComponent(sessionToken);
  const configuredName = normalizeCookieName(
    process.env.DDAJEWELS_AUTH_COOKIE_NAME,
  );
  const names = [configuredName, "dda_session", "__Host-dda_session"].filter(
    (name, index, values): name is string =>
      Boolean(name) && values.indexOf(name) === index,
  );

  return names.map((name) => `${name}=${encoded}`).join("; ");
}

function normalizeCookieName(value: string | undefined) {
  const name = value?.trim();
  if (!name || !/^[A-Za-z0-9_.-]+$/.test(name)) return null;
  return name;
}
