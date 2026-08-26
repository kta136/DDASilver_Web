import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import {
  coinShapeLabels,
  idolConstructionLabels,
  materialLabels,
  purityLabels,
} from "@/lib/catalog-labels";
import { shouldContainProductImage } from "@/lib/catalog-image-presentation";
import type { Product } from "@/types/catalog";
import { getProductIdentity } from "@/lib/seo";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  headingLevel?: 2 | 3;
  compactImage?: boolean;
};

export function ProductCard({
  product,
  priority = false,
  headingLevel = 3,
  compactImage = false,
}: ProductCardProps) {
  const image = product.images[0];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const containImage =
    compactImage || shouldContainProductImage(product, compactImage);
  const details = [
    product.material === "gold" ? materialLabels.gold : null,
    product.purity ? `${purityLabels[product.purity]} purity` : null,
    product.weightGrams ? `${product.weightGrams} g` : null,
    product.heightInches ? `Height ${product.heightInches} in` : null,
    product.widthInches ? `Width ${product.widthInches} in` : null,
    product.singhasanWidthInches && product.singhasanDepthInches
      ? `Singhasan: ${product.singhasanWidthInches} × ${product.singhasanDepthInches} in`
      : null,
    product.deities.length > 0
      ? product.deities.map((deity) => deity.title).join(", ")
      : null,
    product.idolConstruction
      ? idolConstructionLabels[product.idolConstruction]
      : null,
    product.coinShape ? coinShapeLabels[product.coinShape] : null,
  ].filter(Boolean);

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div
          className={`relative overflow-hidden bg-[#ece8e3] ${
            compactImage ? "aspect-square" : "aspect-[4/5]"
          }`}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={
                containImage
                  ? "object-contain transition duration-500"
                  : product.coinShape
                    ? "object-cover transition duration-500"
                    : "object-cover transition duration-500 group-hover:scale-[1.025]"
              }
              style={{ objectPosition: image.objectPosition ?? "center" }}
            />
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-line py-4">
          <div>
            <Heading className="font-display text-2xl font-semibold leading-tight">
              {getProductIdentity(product)}
            </Heading>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">
              {details.length > 0 ? details.join(" · ") : "Enquire for details"}
            </p>
          </div>
          <ArrowRightIcon
            size={19}
            className="mt-1 shrink-0 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </Link>
    </article>
  );
}
