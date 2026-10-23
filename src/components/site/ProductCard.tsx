"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/safe";
import type { Product, SiteSettings } from "@/lib/types";
import { SmartLink } from "./SmartLink";

export function ProductCard({ product: p, settings }: { product: Product; settings: SiteSettings }) {
  const { shop, contact } = settings;
  const variants = (Array.isArray(p.variants) ? p.variants : []).filter((v) => v.label);
  const [choice, setChoice] = useState(() => Math.max(0, variants.findIndex((v) => v.in_stock)));
  const v = variants[choice];

  const prices = variants.map((x) => x.price).filter((x): x is number => typeof x === "number");
  const price = v ? (v.price ?? p.price) : p.price;
  const link = v ? v.stripe_link || p.stripe_link : p.stripe_link;
  const inStock = p.in_stock && (v ? v.in_stock : true);
  const fallback = contact.phone
    ? `tel:${contact.phone.replace(/[^\d+]/g, "")}`
    : contact.email
      ? `mailto:${contact.email}`
      : "#contact";

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
        {variants.length > 0 && (
          <label className="variant">
            <span>{shop.optionLabel}</span>
            <select value={choice} onChange={(e) => setChoice(Number(e.target.value))}>
              {variants.map((x, i) => (
                <option key={i} value={i}>
                  {x.label}
                  {typeof x.price === "number" ? ` – ${formatPrice(x.price, shop.currency)}` : ""}
                  {x.in_stock ? "" : ` (${shop.soldOutLabel})`}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="price-row">
          {price !== null && price !== undefined && <span className="price">{formatPrice(price, shop.currency)}</span>}
          {!v && prices.length > 1 && (
            <span className="muted">
              {shop.fromLabel} {formatPrice(Math.min(...prices), shop.currency)}
            </span>
          )}
          {p.compare_at_price !== null && price !== null && price !== undefined && p.compare_at_price > price && (
            <span className="compare">{formatPrice(p.compare_at_price, shop.currency)}</span>
          )}
        </div>
        {inStock ? (
          link ? (
            <SmartLink href={link} className="btn btn-primary btn-block">
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
