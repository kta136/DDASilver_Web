import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { isSafeReturnTo } from "@/lib/auth/transaction";
import { isSameOriginRequest } from "@/lib/security/same-origin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = await request.formData();
  const returnTo = isSafeReturnTo(body.get("returnTo")?.toString() ?? "/");
  const draft = await draftMode();
  draft.disable();
  redirect(returnTo);
}
