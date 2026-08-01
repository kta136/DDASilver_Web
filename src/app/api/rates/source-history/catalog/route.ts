import { proxyDdaJewelsRates } from "@/lib/rates/proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return proxyDdaJewelsRates(request, "source-history-catalog");
}
