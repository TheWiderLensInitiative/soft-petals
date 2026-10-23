import type { SectionConfig, SectionKey, SiteSettings } from "./types";

export const SECTION_KEYS: SectionKey[] = [
  "hero",
  "about",
  "services",
  "products",
  "gallery",
  "testimonials",
  "faqs",
  "contact",
];

const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: "hero", visible: true, navLabel: "Home", heading: "", subheading: "" },
  {
    key: "products",
    visible: true,
    navLabel: "Shop",
    heading: "Shop Our Hair",
    subheading: "100% natural human hair bundles, wigs, closures and frontals.",
  },
  { key: "about", visible: true, navLabel: "About", heading: "Why Soft Petals", subheading: "" },
  { key: "gallery", visible: true, navLabel: "Gallery", heading: "Real Hair, Real Results", subheading: "" },
  { key: "testimonials", visible: true, navLabel: "Reviews", heading: "Customer Love", subheading: "" },
  {
    key: "services",
    visible: false,
    navLabel: "Services",
    heading: "Installs & Services",
    subheading: "",
  },
  { key: "faqs", visible: true, navLabel: "FAQ", heading: "Shipping, Returns & Hair Care", subheading: "" },
  { key: "contact", visible: true, navLabel: "Contact", heading: "Get in Touch", subheading: "" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: "Soft Petals",
    tagline: "Raw Hair Collection",
    logoUrl: "/brand/icon.webp",
    showName: true,
    faviconUrl: "/brand/icon.webp",
  },
  theme: {
    // Taken from the Soft Petals logo: black, hot pink, gold.
    primary: "#e3297f",
    primaryText: "#ffffff",
    accent: "#d8a84e",
    background: "#000000",
    surface: "#171113",
    text: "#f6ede3",
    mutedText: "#bba99a",
    headingColor: "#e4bd6a",
    headerBackground: "#000000",
    headerText: "#f6ede3",
    footerBackground: "#000000",
    footerText: "#e4bd6a",
    logoFont: "Great Vibes",
    headingFont: "Cinzel",
    bodyFont: "Jost",
    baseFontSize: 16,
    radius: 12,
  },
  contact: {
    phone: "",
    email: "",
    address: "",
    showMap: false,
    hours: [],
  },
  social: { instagram: "", facebook: "", tiktok: "", youtube: "", x: "" },
  booking: { label: "Shop Now", url: "/shop", showInHeader: true },
  hero: {
    logoUrl: "/brand/logo.webp",
    heading: "100% raw, natural human hair.",
    subheading: "Bundles, wigs, closures and frontals made from real human hair that looks, feels and wears like your own.",
    imageUrl: "",
    overlayOpacity: 45,
    primaryLabel: "Shop Hair",
    primaryUrl: "/shop",
    secondaryLabel: "Read Reviews",
    secondaryUrl: "#testimonials",
  },
  about: {
    body:
      "Tell your story here: who you are, where your hair comes from, and why customers keep coming back.\n\nEdit this text from the dashboard under Site Settings → About.",
    imageUrl: "",
  },
  shop: {
    buyLabel: "Buy Now",
    soldOutLabel: "Sold Out",
    noLinkLabel: "Contact to Order",
    optionLabel: "Length",
    fromLabel: "From",
    currency: "USD",
    showShopPage: true,
    shopNavLabel: "Shop",
  },
  servicesOptions: { bookLabel: "Book", depositLabel: "Pay Now" },
  sections: DEFAULT_SECTIONS,
  footer: { text: "" },
  seo: {
    title: "",
    description: "100% natural human hair bundles, wigs, closures and frontals.",
    ogImageUrl: "/brand/logo.webp",
  },
};

export const FONT_OPTIONS = [
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Libre Baskerville",
  "Lora",
  "Marcellus",
  "Cinzel",
  "Abril Fatface",
  "Bodoni Moda",
  "Great Vibes",
  "Dancing Script",
  "Pacifico",
  "Poppins",
  "Montserrat",
  "Inter",
  "Lato",
  "Open Sans",
  "Raleway",
  "Nunito",
  "Josefin Sans",
  "Quicksand",
  "Work Sans",
  "Outfit",
  "Jost",
];

// Google Fonts rejects a request for weights a family doesn't have, so these are listed per font.
const FONT_WEIGHTS: Record<string, string> = {
  "Great Vibes": "",
  Pacifico: "",
  "Abril Fatface": "",
  "DM Serif Display": "",
  Marcellus: "",
  Lato: "400;700",
  "Libre Baskerville": "400;700",
};

/** Google Fonts stylesheet URL for one family. Fonts typed in by the owner load at their default weight. */
export function fontHref(name: string): string {
  const family = name.trim().replace(/ /g, "+");
  const known = FONT_OPTIONS.includes(name);
  const weights = name in FONT_WEIGHTS ? FONT_WEIGHTS[name] : known ? "400;500;600;700" : "";
  return `https://fonts.googleapis.com/css2?family=${family}${weights ? `:wght@${weights}` : ""}&display=swap`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) {
    if (override === undefined || override === null) return base;
    if (Array.isArray(base) !== Array.isArray(override)) return base;
    if (typeof base !== typeof override && !Array.isArray(base)) return base;
    return override as T;
  }
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in base ? deepMerge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}

/** Fills in anything missing from the saved settings so new fields always have a value. */
export function mergeSettings(saved: unknown): SiteSettings {
  const merged = deepMerge(DEFAULT_SETTINGS, saved);
  // Keep the saved section order, drop unknown keys and add any sections that are new.
  const savedSections = Array.isArray(merged.sections) ? merged.sections : [];
  const seen = new Set<SectionKey>();
  const sections: SectionConfig[] = [];
  for (const s of savedSections) {
    if (!s || !SECTION_KEYS.includes(s.key) || seen.has(s.key)) continue;
    seen.add(s.key);
    const def = DEFAULT_SECTIONS.find((d) => d.key === s.key)!;
    sections.push({ ...def, ...s });
  }
  for (const def of DEFAULT_SECTIONS) if (!seen.has(def.key)) sections.push(def);
  merged.sections = sections;
  return merged;
}
