/* eslint-disable @next/next/no-img-element */

import {
  idolConstructionLabels,
  purityLabels,
} from "@/lib/catalog-labels";
import {
  getProductSeoName,
  getSocialImageProductUrl,
} from "@/lib/seo";
import type { Product } from "@/types/catalog";

type ProductSocialImageProps = {
  product: Product;
};

export function ProductSocialImage({ product }: ProductSocialImageProps) {
  const productName = getProductSeoName(product.title, product.reference);
  const fontSize = productName.length > 52 ? 45 : productName.length > 36 ? 52 : 60;
  const details = [
    product.purity ? `${purityLabels[product.purity]} purity` : null,
    product.weightGrams ? `${product.weightGrams} g` : null,
    product.idolConstruction
      ? idolConstructionLabels[product.idolConstruction]
      : null,
    product.deities.length > 0
      ? product.deities.map((deity) => deity.title).join(" · ")
      : null,
  ].filter(Boolean);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        background:
          "linear-gradient(135deg, #f8f3eb 0%, #eee4d6 58%, #e1d1bd 100%)",
        color: "#241f1a",
        padding: 40,
      }}
    >
      <div
        style={{
          width: 570,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "22px 44px 22px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 66,
              height: 66,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #9b7444",
              borderRadius: 999,
              color: "#76542f",
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            DDA
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 18,
            }}
          >
            <div
              style={{
                fontSize: 29,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              DDA Silver
            </div>
            <div
              style={{
                color: "#765f49",
                fontSize: 15,
                letterSpacing: "0.17em",
                marginTop: 2,
                textTransform: "uppercase",
              }}
            >
              Agra
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: 72,
              height: 3,
              background: "#a77d49",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              display: "flex",
              color: "#28211b",
              fontSize,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.04,
            }}
          >
            {productName}
          </div>
          {details.length > 0 ? (
            <div
              style={{
                display: "flex",
                color: "#6c5946",
                fontSize: 18,
                lineHeight: 1.35,
                marginTop: 20,
              }}
            >
              {details.join(" · ")}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#765f49",
            fontSize: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {product.reference ? `Item ${product.reference}` : "Silver craftsmanship"}
        </div>
      </div>

      <div
        style={{
          width: 550,
          height: 550,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          overflow: "hidden",
          border: "1px solid rgba(118, 84, 47, 0.24)",
          borderRadius: 28,
          background: "#f1e9df",
          boxShadow: "0 24px 70px rgba(82, 57, 31, 0.16)",
        }}
      >
        <img
          src={getSocialImageProductUrl(product.images[0].src)}
          alt=""
          width={550}
          height={550}
          style={{ width: 550, height: 550, objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
