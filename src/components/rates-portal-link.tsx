import type { ComponentProps } from "react";

import { resolveRatesPortalUrl } from "@/lib/rates/portal";

type RatesPortalLinkProps = Omit<ComponentProps<"a">, "href">;

export function RatesPortalLink(props: RatesPortalLinkProps) {
  return <a {...props} href={resolveRatesPortalUrl()} />;
}
