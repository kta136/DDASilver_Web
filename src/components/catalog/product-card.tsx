import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import {
  coinShapeLabels,
  idolConstructionLabels,
  purityLabels,
} from "@/lib/catalog-labels";
import type { Product } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  headingLevel?: 2 | 3;
};

export function ProductCard({
  product,
  priority = false,
  headingLevel = 3,
}: ProductCardProps) {
  const image = product.images[0];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const details = [
    product.purity ? `${purityLabels[product.purity]} purity` : null,
    product.idolConstruction
      ? idolConstructionLabels[product.idolConstruction]
      : null,
    product.coinShape ? coinShapeLabels[product.coinShape] : null,
  ].filter(Boolean);

  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="block no-underline"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ece8e3]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={
                product.coinShape
                  ? "object-contain transition duration-500"
                  : "object-cover transition duration-500 group-hover:scale-[1.025]"
              }
              style={{ objectPosition: image.objectPosition ?? "center" }}
            />
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-line py-4">
          <div>
            <Heading className="font-display text-2xl font-semibold leading-tight">
              {product.title}
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
