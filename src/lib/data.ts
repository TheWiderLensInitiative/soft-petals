import { cache } from "react";
import { mergeSettings } from "./defaults";
import { createPublicClient } from "./supabase/public";
import type { SiteData } from "./types";

export const getSiteData = cache(async (): Promise<SiteData> => {
  const db = createPublicClient();
  const byOrder = { ascending: true } as const;
  const [settings, products, services, gallery, testimonials, faqs, promotions] = await Promise.all([
    db.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    db.from("products").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
    db.from("services").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
    db.from("gallery").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
    db.from("testimonials").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
    db.from("faqs").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
    db.from("promotions").select("*").eq("active", true).order("sort_order", byOrder).order("created_at", byOrder),
  ]);

  const now = Date.now();
  const livePromos = (promotions.data ?? []).filter(
    (p) =>
      (!p.starts_at || new Date(p.starts_at).getTime() <= now) &&
      (!p.ends_at || new Date(p.ends_at).getTime() > now),
  );

  return {
    settings: mergeSettings(settings.data?.data),
    products: products.data ?? [],
    services: services.data ?? [],
    gallery: gallery.data ?? [],
    testimonials: testimonials.data ?? [],
    faqs: faqs.data ?? [],
    promotions: livePromos,
  };
});
