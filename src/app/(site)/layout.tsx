import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { hasContent } from "@/components/site/Sections";
import { PromoBar } from "@/components/site/PromoBar";
import { PromoPopup } from "@/components/site/PromoPopup";
import { DEFAULT_SETTINGS, fontHref } from "@/lib/defaults";
import { getSiteData } from "@/lib/data";
import { safeColor, safeFont } from "@/lib/safe";

// Always render with the latest dashboard content.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const title = settings.seo.title || `${settings.brand.name} | ${settings.brand.tagline}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return {
    metadataBase: new URL(siteUrl),
    title,
    description: settings.seo.description,
    icons: settings.brand.faviconUrl ? { icon: settings.brand.faviconUrl } : undefined,
    openGraph: {
      title,
      description: settings.seo.description,
      images: settings.seo.ogImageUrl || settings.hero.imageUrl || undefined,
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  const { theme } = data.settings;
  const d = DEFAULT_SETTINGS.theme;
  const logoFont = safeFont(theme.logoFont, d.logoFont);
  const headingFont = safeFont(theme.headingFont, d.headingFont);
  const bodyFont = safeFont(theme.bodyFont, d.bodyFont);
  const fontSize = Math.min(22, Math.max(12, Number(theme.baseFontSize) || d.baseFontSize));
  const radius = Math.min(40, Math.max(0, Number(theme.radius) || 0));

  const css = `:root{
--primary:${safeColor(theme.primary, d.primary)};
--primary-text:${safeColor(theme.primaryText, d.primaryText)};
--accent:${safeColor(theme.accent, d.accent)};
--bg:${safeColor(theme.background, d.background)};
--surface:${safeColor(theme.surface, d.surface)};
--text:${safeColor(theme.text, d.text)};
--muted:${safeColor(theme.mutedText, d.mutedText)};
--heading-color:${safeColor(theme.headingColor, d.headingColor)};
--header-bg:${safeColor(theme.headerBackground, d.headerBackground)};
--header-text:${safeColor(theme.headerText, d.headerText)};
--footer-bg:${safeColor(theme.footerBackground, d.footerBackground)};
--footer-text:${safeColor(theme.footerText, d.footerText)};
--font-logo:"${logoFont}",cursive;
--font-heading:"${headingFont}",Georgia,serif;
--font-body:"${bodyFont}",system-ui,sans-serif;
--radius:${radius}px;
font-size:${fontSize}px;
}`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {[...new Set([logoFont, headingFont, bodyFont])].map((f) => (
        <link key={f} rel="stylesheet" href={fontHref(f)} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="site">
        <PromoBar promotions={data.promotions.filter((p) => p.display !== "popup")} />
        <Header settings={data.settings} filled={data.settings.sections.filter((s) => hasContent(s.key, data)).map((s) => s.key)} />
        <main>{children}</main>
        <Footer settings={data.settings} />
        <PromoPopup promotions={data.promotions.filter((p) => p.display !== "bar")} />
      </div>
    </>
  );
}
