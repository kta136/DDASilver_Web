import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  compact?: boolean;
  masthead?: boolean;
};

export function BrandMark({
  compact = false,
  masthead = false,
}: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={
        masthead
          ? "brand-masthead no-underline"
          : "inline-flex items-center gap-3 no-underline"
      }
    >
      {masthead ? (
        <span className="brand-masthead-type" aria-hidden="true">
          <span>DDA</span>
          <span>SILVER</span>
        </span>
      ) : null}
      <Image
        src="/brand/dda-family-mark-v1.webp"
        alt=""
        width={402}
        height={346}
        sizes={compact ? "50px" : "(min-width: 1440px) 86px, 62px"}
        data-compact={compact}
        className={masthead ? "sr-only" : "brand-family-mark object-contain"}
      />
      <span
        className={`${masthead ? "sr-only" : ""} flex min-w-0 flex-col justify-center border-l border-line text-ink ${
          compact ? "gap-0.5 pl-2.5" : "gap-1 pl-3"
        }`}
      >
        <span
          className={`whitespace-nowrap font-semibold leading-none tracking-[0.2em] ${
            compact ? "text-[14.5pt]" : "text-[16pt] sm:text-[19pt]"
          }`}
        >
          DDA SILVER
        </span>
        <span
          className={`whitespace-nowrap font-medium tracking-[0.06em] text-ink-muted ${
            compact ? "text-[0.48rem]" : "text-[0.52rem] sm:text-[0.62rem]"
          }`}
        >
          Deen Dayal Anand Kumar Sarraf
        </span>
      </span>
    </Link>
  );
}
