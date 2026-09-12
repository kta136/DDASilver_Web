import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/catalog";

export function CategoryIndex({ categories }: { categories: Category[] }) {
  return (
    <section className="collection-index">
      <div className="site-container collection-layout">
        <div className="collection-intro">
          <p className="eyebrow">Explore our collection</p>
          <h2>
            Timeless silver.{" "}
            <span className="collection-heading-line">For every moment.</span>
          </h2>
          <p>
            For daily rituals, thoughtful gifts and the occasions you hold
            close.
          </p>
          <Link href="/products" className="text-link">
            Discover all silver <ArrowRightIcon size={17} aria-hidden="true" />
          </Link>
        </div>
        <nav aria-label="Shop by category" className="min-w-0">
          <ul className="collection-panels">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`}>
                  <span className="collection-photo">
                    <Image
                      src={category.image.src}
                      alt=""
                      fill
                      sizes="(max-width: 639px) 43vw, (max-width: 1023px) 28vw, 15vw"
                      className="object-contain transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </span>
                  <span className="collection-caption">
                    {category.title}
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {categories.length > 5 ? (
            <div className="collection-more">
              <span>Also discover</span>
              {categories.slice(5).map((category) => (
                <Link href={`/category/${category.slug}`} key={category.slug}>
                  {category.title}
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
      </div>
    </section>
  );
}
