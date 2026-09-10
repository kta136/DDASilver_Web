import { getPublishedCatalog } from "@/sanity/lib/catalog";
import { withGalleryPrices } from "@/lib/pricing/service";

/** Published estimates only: never expose pricing inputs or draft content. */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const catalog = await getPublishedCatalog();
    if (catalog.source !== "sanity") throw new Error("Catalog unavailable");
    const products = await withGalleryPrices(catalog.products);
    return Response.json(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        items: products
          .filter((product) => product._id)
          .map(({ _id, slug, estimate }) => ({ id: _id, slug, estimate })),
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Gallery prices are temporarily unavailable." },
      { status: 503, headers },
    );
  }
}
