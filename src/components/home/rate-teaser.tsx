import {
  ArrowRightIcon,
  BroadcastIcon,
} from "@phosphor-icons/react/ssr";

import { RatesPortalLink } from "@/components/rates-portal-link";

export function RateTeaser() {
  return (
    <aside className="border-l border-line bg-[#f6f3ef] px-7 py-8 lg:px-10 min-[90rem]:py-6">
      <p className="eyebrow">Live silver rate</p>
      <h2 className="font-display mt-3 text-4xl font-semibold leading-none">
        Stay updated with real-time silver rates.
      </h2>
      <div className="mt-7 border-y border-line py-5">
        <p
          className="flex items-center gap-3 text-sm text-ink-muted"
          aria-live="polite"
        >
          <BroadcastIcon size={18} className="text-sage" aria-hidden="true" />
          Opens the secure DDAJewels live-rates portal.
        </p>
      </div>
      <RatesPortalLink className="button-secondary mt-7 no-underline">
        View live rates
        <ArrowRightIcon size={18} aria-hidden="true" />
      </RatesPortalLink>
    </aside>
  );
}
