import { cookies } from "next/headers";

import { sessionCookie } from "@/lib/auth/config";
import { isSameOriginRequest } from "@/lib/security/same-origin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
