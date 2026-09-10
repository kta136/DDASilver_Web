import { resolve } from "node:path";
import { GalleryRateStore } from "../src/lib/pricing/store";
import { fetchGalleryReference } from "../src/lib/pricing/upstream";
import { isAllowedDdaJewelsUrl } from "../src/lib/security/external-service";

async function main() {
  const directory = process.env.GALLERY_PRICING_DIR;
  if (!directory)
    throw new Error(
      "Set GALLERY_PRICING_DIR to the persistent gallery pricing directory.",
    );
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--refresh"))
    throw new Error("Only --refresh is supported.");
  if (
    args.includes("--refresh") &&
    !isAllowedDdaJewelsUrl(process.env.DDAJEWELS_RATES_SNAPSHOT_URL)
  )
    throw new Error(
      "Configure DDAJEWELS_RATES_SNAPSHOT_URL with the approved HTTPS DDAJewels feed before refreshing.",
    );
  const store = new GalleryRateStore(resolve(directory));
  if (args.includes("--refresh"))
    console.log(`Refresh: ${await store.refresh(fetchGalleryReference)}`);
  const result = await store.read();
  console.log(JSON.stringify(result, null, 2));
  if (!result.record?.reference) process.exitCode = 1;
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
