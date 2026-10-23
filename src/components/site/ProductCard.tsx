import { formatPrice } from "@/lib/safe";
import type { Product, SiteSettings } from "@/lib/types";
import { SmartLink } from "./SmartLink";

export function ProductCard({ product: p, settings }: { product: Product; settings: SiteSettings }) {
  const { shop, contact } = settings;
  const fallback = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : contact.email ? `mailto:${contact.email}` : "#contact";
  return (
    <article className="card product">
      <div className="card-image">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.name} loading="lazy" />
        ) : (
          <div className="image-placeholder" />
        )}
        {!p.in_stock && <span className="badge">{shop.soldOutLabel}</span>}
      </div>
      <div className="card-body">
        {p.category && <div className="eyebrow">{p.category}</div>}
        <h3>{p.name}</h3>
        {p.description && <p className="muted">{p.description}</p>}
        <div className="price-row">
          {p.price !== null && <span className="price">{formatPrice(p.price, shop.currency)}</span>}
          {p.compare_at_price !== null && p.price !== null && p.compare_at_price > p.price && (
            <span className="compare">{formatPrice(p.compare_at_price, shop.currency)}</span>
          )}
        </div>
        {p.in_stock ? (
          p.stripe_link ? (
            <SmartLink href={p.stripe_link} className="btn btn-primary btn-block">
              {shop.buyLabel}
            </SmartLink>
          ) : (
            <SmartLink href={fallback} className="btn btn-outline btn-block">
              {shop.noLinkLabel}
            </SmartLink>
          )
        ) : (
          <span className="btn btn-disabled btn-block">{shop.soldOutLabel}</span>
        )}
      </div>
    </article>
  );
}
