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
  { key: "about", visible: true, navLabel: "About", heading: "About Us", subheading: "" },
  {
    key: "services",
    visible: true,
    navLabel: "Services",
    heading: "Services",
    subheading: "Natural styles, silk presses, sew-ins, wig installs and more.",
  },
  {
    key: "products",
    visible: true,
    navLabel: "Shop",
    heading: "Shop Hair & Care",
    subheading: "Bundles, closures, wigs and the products we use in the chair.",
  },
  { key: "gallery", visible: true, navLabel: "Gallery", heading: "Our Work", subheading: "" },
  { key: "testimonials", visible: true, navLabel: "Reviews", heading: "Client Love", subheading: "" },
  { key: "faqs", visible: true, navLabel: "FAQ", heading: "Questions & Policies", subheading: "" },
  { key: "contact", visible: true, navLabel: "Contact", heading: "Visit Us", subheading: "" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: "Your Salon Name",
    tagline: "Natural Hair & Weave Studio",
    logoUrl: "",
    faviconUrl: "",
  },
  theme: {
    primary: "#7a4b2a",
    primaryText: "#ffffff",
    accent: "#d4a373",
    background: "#fdf8f3",
    surface: "#ffffff",
    text: "#2b1d14",
    mutedText: "#6f5b4d",
    headerBackground: "#fdf8f3",
    headerText: "#2b1d14",
    footerBackground: "#2b1d14",
    footerText: "#f5ebe0",
    headingFont: "Playfair Display",
    bodyFont: "Poppins",
    baseFontSize: 16,
    radius: 12,
  },
  contact: {
    phone: "",
    email: "",
    address: "",
    showMap: true,
    hours: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "9am – 6pm" },
      { day: "Wednesday", hours: "9am – 6pm" },
      { day: "Thursday", hours: "9am – 6pm" },
      { day: "Friday", hours: "9am – 7pm" },
      { day: "Saturday", hours: "8am – 4pm" },
      { day: "Sunday", hours: "Closed" },
    ],
  },
  social: { instagram: "", facebook: "", tiktok: "", youtube: "", x: "" },
  booking: { label: "Book Now", url: "#services", showInHeader: true },
  hero: {
    heading: "Healthy hair. Flawless installs.",
    subheading: "Natural hair care, protective styles and custom weaves, done with love.",
    imageUrl: "",
    overlayOpacity: 45,
    primaryLabel: "Book an Appointment",
    primaryUrl: "#services",
    secondaryLabel: "Shop Hair",
    secondaryUrl: "#products",
  },
  about: {
    body:
      "Tell your story here. Who you are, how long you have been doing hair, and what makes your chair special.\n\nEdit this text from the dashboard under Settings → About.",
    imageUrl: "",
  },
  shop: {
    buyLabel: "Buy Now",
    soldOutLabel: "Sold Out",
    noLinkLabel: "Contact to Order",
    currency: "USD",
    showShopPage: true,
    shopNavLabel: "Shop",
  },
  servicesOptions: { bookLabel: "Book", depositLabel: "Pay Deposit" },
  sections: DEFAULT_SECTIONS,
  footer: { text: "" },
  seo: {
    title: "",
    description: "Natural hair care, protective styles, sew-ins and wig installs.",
    ogImageUrl: "",
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
