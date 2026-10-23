import Link from "next/link";
import type { SectionKey, SiteSettings } from "@/lib/types";
import { SmartLink } from "./SmartLink";

export function Header({ settings, filled }: { settings: SiteSettings; filled: SectionKey[] }) {
  const { brand, booking, shop, sections } = settings;
  const nav = sections.filter((s) => s.visible && s.key !== "hero" && s.navLabel && filled.includes(s.key));
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          {brand.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.showName ? "" : brand.name} className="brand-logo" />
          )}
          {(brand.showName || !brand.logoUrl) && <span className="brand-name">{brand.name}</span>}
        </Link>
        <input type="checkbox" id="nav-toggle" className="nav-toggle" aria-label="Open menu" />
        <label htmlFor="nav-toggle" className="nav-burger" aria-hidden="true">
          <span />
          <span />
          <span />
        </label>
        <nav className="nav">
          {nav.map((s) =>
            s.key === "products" && shop.showShopPage ? (
              <a key={s.key} href="/shop">
                {shop.shopNavLabel || s.navLabel}
              </a>
            ) : (
              <a key={s.key} href={`/#${s.key}`}>
                {s.navLabel}
              </a>
            ),
          )}
          {booking.showInHeader && booking.label && (
            <SmartLink href={booking.url} className="btn btn-primary btn-sm">
              {booking.label}
            </SmartLink>
          )}
        </nav>
      </div>
    </header>
  );
}
