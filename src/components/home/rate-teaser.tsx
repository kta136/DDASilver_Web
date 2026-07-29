import {
  ArrowRightIcon,
  BroadcastIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

const rateFeedConfigured = Boolean(
  process.env.DDAJEWELS_RATES_SNAPSHOT_URL,
);

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
          {rateFeedConfigured ? (
            <BroadcastIcon size={18} className="text-sage" aria-hidden="true" />
          ) : (
            <CircleNotchIcon
              size={18}
              className="text-copper"
              aria-hidden="true"
            />
          )}
          {rateFeedConfigured
            ? "Connecting to the live silver feed."
            : "Live feed configuration is pending."}
        </p>
      </div>
      <Link href="/rates" className="button-secondary mt-7 no-underline">
        View live rates
        <ArrowRightIcon size={18} aria-hidden="true" />
      </Link>
    </aside>
  );
}
