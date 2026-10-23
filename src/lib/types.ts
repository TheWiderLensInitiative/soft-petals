export type SectionKey =
  | "hero"
  | "about"
  | "services"
  | "products"
  | "gallery"
  | "testimonials"
  | "faqs"
  | "contact";

export interface SectionConfig {
  key: SectionKey;
  visible: boolean;
  navLabel: string;
  heading: string;
  subheading: string;
}

export interface SiteSettings {
  brand: { name: string; tagline: string; logoUrl: string; faviconUrl: string };
  theme: {
    primary: string;
    primaryText: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    headerBackground: string;
    headerText: string;
    footerBackground: string;
    footerText: string;
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    radius: number;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    showMap: boolean;
    hours: { day: string; hours: string }[];
  };
  social: { instagram: string; facebook: string; tiktok: string; youtube: string; x: string };
  booking: { label: string; url: string; showInHeader: boolean };
  hero: {
    heading: string;
    subheading: string;
    imageUrl: string;
    overlayOpacity: number;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };
  about: { body: string; imageUrl: string };
  shop: {
    buyLabel: string;
    soldOutLabel: string;
    noLinkLabel: string;
    optionLabel: string;
    fromLabel: string;
    currency: string;
    showShopPage: boolean;
    shopNavLabel: string;
  };
  servicesOptions: { bookLabel: string; depositLabel: string };
  sections: SectionConfig[];
  footer: { text: string };
  seo: { title: string; description: string; ogImageUrl: string };
}

export interface Variant {
  label: string;
  price: number | null;
  stripe_link: string;
  in_stock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  compare_at_price: number | null;
  category: string;
  image_url: string;
  stripe_link: string;
  variants: Variant[];
  in_stock: boolean;
  featured: boolean;
  active: boolean;
  sort_order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_text: string;
  duration: string;
  category: string;
  image_url: string;
  stripe_link: string;
  booking_url: string;
  active: boolean;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
  active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  image_url: string;
  active: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
}

export interface Promotion {
  id: string;
  title: string;
  message: string;
  code: string;
  button_label: string;
  button_url: string;
  display: "bar" | "popup" | "both";
  bg_color: string;
  text_color: string;
  image_url: string;
  popup_delay_seconds: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface SiteData {
  settings: SiteSettings;
  products: Product[];
  services: Service[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
  promotions: Promotion[];
}
