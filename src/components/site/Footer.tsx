import type { SiteSettings } from "@/lib/types";
import { SocialLinks } from "./SocialLinks";

export function Footer({ settings }: { settings: SiteSettings }) {
  const { brand, contact, footer } = settings;
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">{brand.name}</div>
          {brand.tagline && <p className="footer-tagline">{brand.tagline}</p>}
        </div>
        <div className="footer-contact">
          {contact.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.address && <span>{contact.address}</span>}
        </div>
        <SocialLinks social={settings.social} />
      </div>
      <div className="container footer-bottom">
        {footer.text || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
      </div>
    </footer>
  );
}
