import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GalleryPriceProvider } from "@/components/catalog/price-context";

export default function SiteLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <GalleryPriceProvider>
      <div className="flex min-h-screen flex-col">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
      {modal}
    </GalleryPriceProvider>
  );
}
