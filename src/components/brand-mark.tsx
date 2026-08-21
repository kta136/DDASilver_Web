import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 no-underline"
    >
      <Image
        src="/brand/dda-family-mark.webp"
        alt=""
        width={402}
        height={346}
        sizes={compact ? "50px" : "(min-width: 1440px) 86px, 62px"}
        data-compact={compact}
        className="brand-family-mark object-contain"
        priority
      />
      <span
        className={`flex min-w-0 flex-col justify-center border-l border-line text-ink ${
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
