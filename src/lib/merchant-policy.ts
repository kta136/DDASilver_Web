import { toAbsoluteUrl } from "@/lib/seo";

export const merchantPolicyPath = "/collection-and-returns";
export const merchantReturnPolicyId = `${toAbsoluteUrl(merchantPolicyPath)}#returns`;

// Owner confirmed showroom collection only and conditional returns/exchanges.
// Google's organization-level URL option describes this without inventing a
// return window, fees, or a shipping service.
export const merchantReturnPolicy = {
  "@type": "MerchantReturnPolicy",
  "@id": merchantReturnPolicyId,
  merchantReturnLink: toAbsoluteUrl(merchantPolicyPath),
};
