import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/catalog";

export function CollectionIndex({
  collections,
}: {
  collections: Collection[];
}) {
  if (collections.length === 0) return null;

  return (
    <section className="collection-index">
      <div className="site-container collection-layout">
        <div className="collection-intro">
          <p className="eyebrow">Shop by collection</p>
          <h2>
            Thoughtful edits. Made to explore.
          </h2>
          <p>
            Browse curated collections of silver for occasions, rituals and
            meaningful gifts.
          </p>
        </div>
        <nav aria-label="Shop by collection" className="min-w-0">
          <ul className="collection-panels">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link href={`/collections/${collection.slug}`}>
                  <span className="collection-photo">
                    <Image
                      src={collection.heroImage.src}
                      alt=""
                      fill
                      sizes="(max-width: 639px) 43vw, (max-width: 1023px) 28vw, 15vw"
                      className="object-contain transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </span>
                  <span className="collection-caption">
                    {collection.title}
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
