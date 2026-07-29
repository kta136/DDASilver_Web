import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/types/catalog";

type CategoryIndexProps = {
  categories: Category[];
};

export function CategoryIndex({ categories }: CategoryIndexProps) {
  return (
    <nav aria-label="Shop by category" className="border-y border-line bg-white">
      <ul className="site-container grid sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
            <li
              key={category.slug}
              className="border-b border-line last:border-b-0 sm:border-r sm:[&:nth-child(even)]:border-r-0 lg:border-b-0 lg:[&:nth-child(even)]:border-r lg:last:border-r-0"
            >
              <Link
                href={`/category/${category.slug}`}
                className="group flex min-h-32 items-center gap-5 px-4 py-5 no-underline min-[90rem]:min-h-40 min-[90rem]:gap-6 min-[90rem]:px-5"
                data-analytics="category_view"
              >
                <span className="relative size-20 shrink-0 overflow-hidden rounded-full bg-[#ebe7e2] min-[90rem]:size-28">
                  <Image
                    src={category.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 1440px) 112px, 80px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    style={{
                      objectPosition:
                        category.image.objectPosition ?? "center center",
                    }}
                  />
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-2xl font-semibold leading-none min-[90rem]:text-3xl">
                    {category.title}
                  </span>
                  <ArrowRightIcon
                    size={20}
                    className="mt-3 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
        ))}
      </ul>
    </nav>
  );
}
