"use client";

import {
  formatEstimate,
  formatPriceDate,
  type PriceEstimate,
} from "@/lib/pricing/model";
import { useDialogEstimate } from "./price-context";

export function ProductPrice({
  slug,
  estimate,
  details = false,
  dialog = false,
}: {
  slug: string;
  estimate?: PriceEstimate;
  details?: boolean;
  dialog?: boolean;
}) {
  const value = useDialogEstimate(slug, estimate, dialog);
  if (!value) return null;
  if (value.status === "unavailable")
    return (
      <p className="mt-3 text-sm text-ink-muted">
        Price estimate temporarily unavailable. Please enquire.
      </p>
    );
  return (
    <div
      className={details ? "mt-6 border-t border-line pt-5" : "mt-3"}
      data-price-estimate
    >
      <p
        className={
          details ? "text-2xl font-semibold" : "text-base font-semibold"
        }
        data-product-price
        data-currency="INR"
      >
        {formatEstimate(value)}
      </p>
      {details ? (
        <>
          <p className="mt-2 text-xs leading-5 text-ink-muted">
            {value.mode === "manual"
              ? "Price reviewed on: "
              : "Silver rate snapshot: "}
            <time dateTime={value.asOf}>{formatPriceDate(value.asOf)}</time>
          </p>
          {value.lastAvailable ? (
            <p className="mt-2 text-xs text-ink-muted">
              Based on the last available silver rate shown above.
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Includes making charges and taxes. Final price confirmed on enquiry.
          </p>
          {value.sizes.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {value.sizes.map((size) => (
                <li key={`${size.weightGrams}-${size.diameterInches}`}>
                  {size.weightGrams} g / {size.diameterInches} in —{" "}
                  {formatEstimate({
                    ...value,
                    minimum: size.amount,
                    maximum: size.amount,
                  })}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
