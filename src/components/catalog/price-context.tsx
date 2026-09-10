"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import type { PriceEstimate } from "@/lib/pricing/model";

type Selection = { slug: string; estimate: PriceEstimate } | null;
const PriceContext = createContext<{
  selection: Selection;
  select: (value: Selection) => void;
} | null>(null);

export function GalleryPriceProvider({ children }: { children: ReactNode }) {
  const [selection, select] = useState<Selection>(null);
  return (
    <PriceContext.Provider value={{ selection, select }}>
      {children}
    </PriceContext.Provider>
  );
}

export function PricedProductLink({
  slug,
  estimate,
  children,
}: {
  slug: string;
  estimate?: PriceEstimate;
  children: ReactNode;
}) {
  const context = useContext(PriceContext);
  function remember(event: MouseEvent<HTMLAnchorElement>) {
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    )
      context?.select(estimate ? { slug, estimate } : null);
  }
  return (
    <Link
      href={`/products/${slug}`}
      className="block no-underline"
      onClick={remember}
    >
      {children}
    </Link>
  );
}

export function useDialogEstimate(
  slug: string,
  estimate?: PriceEstimate,
  dialog = false,
) {
  const context = useContext(PriceContext);
  return dialog && context?.selection?.slug === slug
    ? context.selection.estimate
    : estimate;
}
