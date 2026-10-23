import type { FieldDef } from "./fields";

export interface CollectionDef {
  table: string;
  label: string;
  singular: string;
  intro: string;
  titleField: string;
  imageField?: string;
  subtitle?: (row: Record<string, unknown>) => string;
  fields: FieldDef[];
  blank: Record<string, unknown>;
}

const STRIPE_HELP =
  "Paste this item's Stripe Payment Link (Stripe Dashboard → Payment Links → New). The button on the site goes straight to it.";

/** A product can be bought online if it has a link, or every option in stock has one. */
export function hasStripeLink(r: Record<string, unknown>): boolean {
  if (r.stripe_link) return true;
  const variants = Array.isArray(r.variants) ? (r.variants as { stripe_link?: string; in_stock?: boolean }[]) : [];
  const live = variants.filter((v) => v.in_stock !== false);
  return live.length > 0 && live.every((v) => v.stripe_link);
}

const money = (v: unknown) => (typeof v === "number" ? `$${v.toFixed(2)}` : "");

export const COLLECTIONS: Record<string, CollectionDef> = {
  products: {
    table: "products",
    label: "Products",
    singular: "product",
    intro: "Everything you sell: bundles, wigs, closures, frontals, care products. Each product (or each length) gets its own Stripe link.",
    titleField: "name",
    imageField: "image_url",
    subtitle: (r) =>
      [
        money(r.price),
        r.category,
        Array.isArray(r.variants) && r.variants.length && `${r.variants.length} options`,
        !hasStripeLink(r) && "⚠ no Stripe link",
        !r.in_stock && "sold out",
        r.featured && "★ featured",
      ]
        .filter(Boolean)
        .join(" · "),
    fields: [
      { name: "name", label: "Product name", type: "text", required: true },
      { name: "image_url", label: "Photo", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price", label: "Price", type: "money", placeholder: "120.00" },
      { name: "compare_at_price", label: "Original price (shows crossed out for a sale)", type: "money" },
      { name: "category", label: "Category", type: "text", placeholder: "Bundles, Wigs, Closures, Frontals…", help: "Customers can filter the shop by category." },
      { name: "stripe_link", label: "Stripe payment link", type: "url", placeholder: "https://buy.stripe.com/…", help: STRIPE_HELP },
      {
        name: "variants",
        label: "Options (lengths, densities…)",
        type: "variants",
        help: "Optional. Add one row per choice, each with its own price and Stripe link. Empty price or link uses the ones above.",
      },
      { name: "in_stock", label: "In stock", type: "checkbox" },
      { name: "featured", label: "Feature on the homepage", type: "checkbox" },
      { name: "active", label: "Show on website", type: "checkbox" },
    ],
    blank: { name: "", description: "", price: null, compare_at_price: null, category: "", image_url: "", stripe_link: "", variants: [], in_stock: true, featured: false, active: true },
  },
  services: {
    table: "services",
    label: "Services",
    singular: "service",
    intro: "Optional: installs, custom wig units or anything else you offer besides hair. Turn the Services section on in Site Settings → Homepage Layout.",
    titleField: "name",
    imageField: "image_url",
    subtitle: (r) => [r.price_text, r.duration, r.category].filter(Boolean).join(" · "),
    fields: [
      { name: "name", label: "Service name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "Installs, Custom Units…" },
      { name: "price_text", label: "Price", type: "text", placeholder: "From $150", help: "Type it exactly how you want it shown." },
      { name: "duration", label: "Time", type: "text", placeholder: "3 hrs" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Photo (optional)", type: "image" },
      { name: "stripe_link", label: "Stripe payment link", type: "url", placeholder: "https://buy.stripe.com/…", help: STRIPE_HELP },
      { name: "booking_url", label: "Booking link", type: "url", help: "Leave empty to use the main booking link from Settings." },
      { name: "active", label: "Show on website", type: "checkbox" },
    ],
    blank: { name: "", description: "", price_text: "", duration: "", category: "", image_url: "", stripe_link: "", booking_url: "", active: true },
  },
  promotions: {
    table: "promotions",
    label: "Deals & Popups",
    singular: "deal",
    intro: "Run a deal as a banner across the top of the site, a popup, or both. Set dates and it turns itself on and off.",
    titleField: "title",
    imageField: "image_url",
    subtitle: (r) =>
      [
        { bar: "Top banner", popup: "Popup", both: "Banner + popup" }[r.display as string],
        r.code && `code ${r.code}`,
        r.ends_at && `ends ${new Date(r.ends_at as string).toLocaleDateString()}`,
      ]
        .filter(Boolean)
        .join(" · "),
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Holiday Sale", help: "The popup headline." },
      { name: "message", label: "Message", type: "textarea", placeholder: "20% off all bundles this weekend only!" },
      { name: "code", label: "Coupon code (optional)", type: "text", placeholder: "HOLIDAY20", help: "Create the matching coupon in Stripe so it works at checkout." },
      {
        name: "display",
        label: "Show as",
        type: "select",
        options: [
          { value: "bar", label: "Top banner" },
          { value: "popup", label: "Popup" },
          { value: "both", label: "Banner + popup" },
        ],
      },
      { name: "button_label", label: "Button text (optional)", type: "text", placeholder: "Shop now" },
      { name: "button_url", label: "Button link", type: "url", placeholder: "/shop or https://…" },
      { name: "image_url", label: "Popup image (optional)", type: "image" },
      { name: "bg_color", label: "Background color", type: "color", help: "Empty uses your theme colors." },
      { name: "text_color", label: "Text color", type: "color" },
      { name: "popup_delay_seconds", label: "Popup delay (seconds)", type: "number", min: 0 },
      { name: "starts_at", label: "Start (optional)", type: "datetime" },
      { name: "ends_at", label: "End (optional)", type: "datetime" },
      { name: "active", label: "Turned on", type: "checkbox" },
    ],
    blank: { title: "", message: "", code: "", display: "bar", button_label: "", button_url: "", image_url: "", bg_color: "", text_color: "", popup_delay_seconds: 3, starts_at: null, ends_at: null, active: true },
  },
  gallery: {
    table: "gallery",
    label: "Gallery",
    singular: "photo",
    intro: "Photos of the hair and customers wearing it.",
    titleField: "caption",
    imageField: "image_url",
    fields: [
      { name: "image_url", label: "Photo", type: "image", required: true },
      { name: "caption", label: "Caption (optional)", type: "text" },
      { name: "active", label: "Show on website", type: "checkbox" },
    ],
    blank: { image_url: "", caption: "", active: true },
  },
  testimonials: {
    table: "testimonials",
    label: "Reviews",
    singular: "review",
    intro: "Client reviews shown on the homepage.",
    titleField: "name",
    imageField: "image_url",
    subtitle: (r) => "★".repeat(Number(r.rating) || 0),
    fields: [
      { name: "name", label: "Client name", type: "text", required: true },
      { name: "quote", label: "Review", type: "textarea", required: true },
      { name: "rating", label: "Stars (1–5)", type: "number", min: 1, max: 5 },
      { name: "image_url", label: "Photo (optional)", type: "image" },
      { name: "active", label: "Show on website", type: "checkbox" },
    ],
    blank: { name: "", quote: "", rating: 5, image_url: "", active: true },
  },
  faqs: {
    table: "faqs",
    label: "FAQ & Policies",
    singular: "question",
    intro: "Shipping, returns, hair care tips and anything customers ask a lot.",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "active", label: "Show on website", type: "checkbox" },
    ],
    blank: { question: "", answer: "", active: true },
  },
};
