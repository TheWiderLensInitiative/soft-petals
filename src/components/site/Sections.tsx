import type { SectionConfig, SiteData } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { SmartLink } from "./SmartLink";
import { SocialLinks } from "./SocialLinks";

function Heading({ section }: { section: SectionConfig }) {
  if (!section.heading && !section.subheading) return null;
  return (
    <div className="section-heading">
      {section.heading && <h2>{section.heading}</h2>}
      {section.subheading && <p className="muted">{section.subheading}</p>}
    </div>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((para, i) => (
          <p key={i}>{para}</p>
        ))}
    </>
  );
}

function groupBy<T extends { category: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = item.category.trim();
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return [...groups.entries()];
}

export function Section({ section, data }: { section: SectionConfig; data: SiteData }) {
  const { settings } = data;
  switch (section.key) {
    case "hero": {
      const h = settings.hero;
      const overlay = Math.min(90, Math.max(0, Number(h.overlayOpacity) || 0)) / 100;
      return (
        <section id="hero" className={`hero ${h.imageUrl ? "hero-image" : ""}`}>
          {h.imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.imageUrl} alt="" className="hero-bg" />
              <div className="hero-overlay" style={{ opacity: overlay }} />
            </>
          )}
          <div className="container hero-content">
            {settings.brand.tagline && <div className="eyebrow">{settings.brand.tagline}</div>}
            <h1>{h.heading}</h1>
            {h.subheading && <p className="hero-sub">{h.subheading}</p>}
            <div className="hero-actions">
              {h.primaryLabel && (
                <SmartLink href={h.primaryUrl} className="btn btn-primary">
                  {h.primaryLabel}
                </SmartLink>
              )}
              {h.secondaryLabel && (
                <SmartLink href={h.secondaryUrl} className="btn btn-outline">
                  {h.secondaryLabel}
                </SmartLink>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "about":
      return (
        <section id="about" className="section">
          <div className={`container about ${settings.about.imageUrl ? "about-split" : ""}`}>
            {settings.about.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.about.imageUrl} alt="" className="about-image" loading="lazy" />
            )}
            <div>
              {section.heading && <h2>{section.heading}</h2>}
              {section.subheading && <p className="muted">{section.subheading}</p>}
              <Paragraphs text={settings.about.body} />
            </div>
          </div>
        </section>
      );

    case "services": {
      if (!data.services.length) return null;
      const opts = settings.servicesOptions;
      return (
        <section id="services" className="section section-alt">
          <div className="container">
            <Heading section={section} />
            {groupBy(data.services).map(([category, items]) => (
              <div key={category} className="service-group">
                {category && <h3 className="group-title">{category}</h3>}
                <div className="services">
                  {items.map((s) => (
                    <article key={s.id} className="card service">
                      {s.image_url && (
                        <div className="card-image">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.image_url} alt={s.name} loading="lazy" />
                        </div>
                      )}
                      <div className="card-body">
                        <div className="service-top">
                          <h3>{s.name}</h3>
                          {s.price_text && <span className="price">{s.price_text}</span>}
                        </div>
                        {s.duration && <div className="eyebrow">{s.duration}</div>}
                        {s.description && <p className="muted">{s.description}</p>}
                        <div className="service-actions">
                          {(s.booking_url || settings.booking.url) && opts.bookLabel && (
                            <SmartLink href={s.booking_url || settings.booking.url} className="btn btn-outline btn-sm">
                              {opts.bookLabel}
                            </SmartLink>
                          )}
                          {s.stripe_link && opts.depositLabel && (
                            <SmartLink href={s.stripe_link} className="btn btn-primary btn-sm">
                              {opts.depositLabel}
                            </SmartLink>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "products": {
      if (!data.products.length) return null;
      const featured = data.products.filter((p) => p.featured);
      const shown = (featured.length ? featured : data.products).slice(0, 8);
      return (
        <section id="products" className="section">
          <div className="container">
            <Heading section={section} />
            <div className="grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} settings={settings} />
              ))}
            </div>
            {settings.shop.showShopPage && data.products.length > shown.length && (
              <div className="center">
                <a href="/shop" className="btn btn-outline">
                  View all
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    case "gallery":
      if (!data.gallery.length) return null;
      return (
        <section id="gallery" className="section section-alt">
          <div className="container">
            <Heading section={section} />
            <div className="gallery">
              {data.gallery.map((g) => (
                <figure key={g.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image_url} alt={g.caption} loading="lazy" />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonials":
      if (!data.testimonials.length) return null;
      return (
        <section id="testimonials" className="section">
          <div className="container">
            <Heading section={section} />
            <div className="testimonials">
              {data.testimonials.map((t) => (
                <blockquote key={t.id} className="card testimonial">
                  <div className="stars" aria-label={`${t.rating} out of 5 stars`}>
                    {"★".repeat(t.rating)}
                    <span className="stars-off">{"★".repeat(5 - t.rating)}</span>
                  </div>
                  <p>“{t.quote}”</p>
                  <footer>
                    {t.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.image_url} alt="" className="avatar" loading="lazy" />
                    )}
                    {t.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      );

    case "faqs":
      if (!data.faqs.length) return null;
      return (
        <section id="faqs" className="section section-alt">
          <div className="container narrow">
            <Heading section={section} />
            {data.faqs.map((f) => (
              <details key={f.id} className="faq">
                <summary>{f.question}</summary>
                <Paragraphs text={f.answer} />
              </details>
            ))}
          </div>
        </section>
      );

    case "contact": {
      const c = settings.contact;
      const hours = c.hours.filter((h) => h.day || h.hours);
      return (
        <section id="contact" className="section">
          <div className="container">
            <Heading section={section} />
            <div className="contact">
              <div className="card contact-card">
                {c.address && (
                  <p>
                    <strong>Address</strong>
                    <br />
                    {c.address}
                  </p>
                )}
                {c.phone && (
                  <p>
                    <strong>Phone</strong>
                    <br />
                    <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>
                  </p>
                )}
                {c.email && (
                  <p>
                    <strong>Email</strong>
                    <br />
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </p>
                )}
                {hours.length > 0 && (
                  <table className="hours">
                    <tbody>
                      {hours.map((h, i) => (
                        <tr key={i}>
                          <td>{h.day}</td>
                          <td>{h.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <SocialLinks social={settings.social} />
              </div>
              {c.showMap && c.address && (
                <iframe
                  className="map"
                  title="Map"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(c.address)}&output=embed`}
                />
              )}
            </div>
          </div>
        </section>
      );
    }
  }
}
