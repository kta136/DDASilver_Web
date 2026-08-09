import { WhatsappLogoIcon } from "@phosphor-icons/react/ssr";
import clsx from "clsx";

import {
  coinShapeLabels,
  idolConstructionLabels,
  purityLabels,
} from "@/lib/catalog-labels";
import { buildWhatsAppProductUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/catalog";

type ProductDetailsProps = {
  product: Product;
  categoryTitle?: string;
  headingLevel: 1 | 2;
  headingId?: string;
  presentation: "page" | "dialog";
};

export function ProductDetails({
  product,
  categoryTitle,
  headingLevel,
  headingId,
  presentation,
}: ProductDetailsProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const isDialog = presentation === "dialog";

  return (
    <>
      <p className="eyebrow">{categoryTitle ?? "DDA Silver"}</p>
      <Heading
        id={headingId}
        className={clsx(
          "font-display text-balance mt-4 font-semibold leading-[0.9]",
          isDialog
            ? "text-[clamp(2.75rem,10vw,4.5rem)]"
            : "text-6xl sm:text-7xl",
        )}
      >
        {product.title}
      </Heading>
      {product.reference ? (
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-muted">
          Reference {product.reference}
        </p>
      ) : null}
      {product.purity ||
      product.weightGrams ||
      product.heightInches ||
      product.widthInches ||
      product.diameterInches ||
      (product.singhasanWidthInches && product.singhasanDepthInches) ||
      product.idolConstruction ||
      product.deities.length > 0 ||
      product.coinShape ? (
        <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-5">
          {product.purity ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Purity
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {purityLabels[product.purity]}
              </dd>
            </div>
          ) : null}
          {product.weightGrams ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Weight
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.weightGrams} g
              </dd>
            </div>
          ) : null}
          {product.heightInches ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Height
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.heightInches} in
              </dd>
            </div>
          ) : null}
          {product.widthInches ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Width
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.widthInches} in
              </dd>
            </div>
          ) : null}
          {product.diameterInches ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Diameter
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.diameterInches} in
              </dd>
            </div>
          ) : null}
          {product.singhasanWidthInches && product.singhasanDepthInches ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Singhasan
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.singhasanWidthInches} × {product.singhasanDepthInches} in
              </dd>
            </div>
          ) : null}
          {product.idolConstruction ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Idol Construction
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {idolConstructionLabels[product.idolConstruction]}
              </dd>
            </div>
          ) : null}
          {product.deities.length > 0 ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                {product.deities.length === 1 ? "Deity" : "Deities"}
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {product.deities.map((deity) => deity.title).join(", ")}
              </dd>
            </div>
          ) : null}
          {product.coinShape ? (
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Shape
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {coinShapeLabels[product.coinShape]}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <p
        className={clsx(
          "mt-7 leading-8 text-ink-muted",
          isDialog ? "text-base" : "text-lg",
        )}
      >
        {product.shortDescription}
      </p>

      <div className="mt-9 border-y border-line py-6">
        <p className="text-sm font-bold">Browse and enquire</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Product pricing and availability are not shown online. Confirm
          availability on WhatsApp with the showroom team.
        </p>
      </div>

      <a
        href={buildWhatsAppProductUrl(product)}
        target="_blank"
        rel="noreferrer"
        className="button-primary mt-8 w-full no-underline sm:w-auto"
        data-analytics="whatsapp_click"
        data-analytics-placement="product_detail"
        data-analytics-product-slug={product.slug}
      >
        <WhatsappLogoIcon size={20} aria-hidden="true" />
        Confirm availability on WhatsApp
      </a>
      <p className="mt-4 text-xs leading-5 text-ink-muted">
        Your message includes this product title, reference, and page link.
      </p>
    </>
  );
}
