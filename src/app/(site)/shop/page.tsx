import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/ProductCard";
import { getSiteData } from "@/lib/data";

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { settings, products } = await getSiteData();
  if (!settings.shop.showShopPage) notFound();
  const { category } = await searchParams;
  const section = settings.sections.find((s) => s.key === "products")!;
  const categories = [...new Set(products.map((p) => p.category.trim()).filter(Boolean))];
  const shown = category ? products.filter((p) => p.category.trim() === category) : products;

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <h1>{section.heading}</h1>
          {section.subheading && <p className="muted">{section.subheading}</p>}
        </div>
        {categories.length > 1 && (
          <div className="chips">
            <a href="/shop" className={`chip ${!category ? "chip-on" : ""}`}>
              All
            </a>
            {categories.map((c) => (
              <a key={c} href={`/shop?category=${encodeURIComponent(c)}`} className={`chip ${c === category ? "chip-on" : ""}`}>
                {c}
              </a>
            ))}
          </div>
        )}
        {shown.length ? (
          <div className="grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} settings={settings} />
            ))}
          </div>
        ) : (
          <p className="center muted">New items coming soon.</p>
        )}
      </div>
    </section>
  );
}
