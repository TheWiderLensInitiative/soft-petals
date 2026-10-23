"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, mergeSettings } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/client";
import type { SectionConfig, SiteSettings } from "@/lib/types";
import { Field, type FieldDef } from "./fields";

type Tab = { id: string; label: string; fields?: FieldDef[]; custom?: "sections" | "hours" };

const SECTION_NAMES: Record<string, string> = {
  hero: "Top banner (hero)",
  about: "About",
  services: "Services",
  products: "Shop / products",
  gallery: "Gallery",
  testimonials: "Reviews",
  faqs: "FAQ & policies",
  contact: "Contact & hours",
};

const TABS: Tab[] = [
  {
    id: "brand",
    label: "Business",
    fields: [
      { name: "brand.name", label: "Business name", type: "text" },
      { name: "brand.tagline", label: "Tagline", type: "text" },
      { name: "brand.logoUrl", label: "Logo", type: "image", help: "If empty, the business name is shown instead." },
      { name: "brand.faviconUrl", label: "Browser tab icon", type: "image", help: "A small square image works best." },
    ],
  },
  {
    id: "theme",
    label: "Colors & Fonts",
    fields: [
      { name: "theme.primary", label: "Main color (buttons, prices)", type: "color" },
      { name: "theme.primaryText", label: "Text on main color", type: "color" },
      { name: "theme.accent", label: "Accent color", type: "color" },
      { name: "theme.background", label: "Page background", type: "color" },
      { name: "theme.surface", label: "Card background", type: "color" },
      { name: "theme.text", label: "Text color", type: "color" },
      { name: "theme.mutedText", label: "Soft text color", type: "color" },
      { name: "theme.headerBackground", label: "Header background", type: "color" },
      { name: "theme.headerText", label: "Header text", type: "color" },
      { name: "theme.footerBackground", label: "Footer background", type: "color" },
      { name: "theme.footerText", label: "Footer text", type: "color" },
      { name: "theme.headingFont", label: "Heading font", type: "font", help: "Pick from the list or type any Google Fonts name." },
      { name: "theme.bodyFont", label: "Body font", type: "font" },
      { name: "theme.baseFontSize", label: "Text size (px)", type: "number", min: 12, max: 22 },
      { name: "theme.radius", label: "Corner roundness (px)", type: "number", min: 0, max: 40, help: "0 = square corners." },
    ],
  },
  { id: "sections", label: "Homepage Layout", custom: "sections" },
  {
    id: "hero",
    label: "Top Banner",
    fields: [
      { name: "hero.heading", label: "Headline", type: "text" },
      { name: "hero.subheading", label: "Text under headline", type: "textarea" },
      { name: "hero.imageUrl", label: "Background photo", type: "image" },
      { name: "hero.overlayOpacity", label: "Photo darkness (0–90)", type: "number", min: 0, max: 90, help: "Darker makes white text easier to read." },
      { name: "hero.primaryLabel", label: "Main button text", type: "text" },
      { name: "hero.primaryUrl", label: "Main button link", type: "url", help: "A website link, or #services, #products, #contact to jump to a section." },
      { name: "hero.secondaryLabel", label: "Second button text", type: "text", help: "Leave empty to hide." },
      { name: "hero.secondaryUrl", label: "Second button link", type: "url" },
    ],
  },
  {
    id: "about",
    label: "About",
    fields: [
      { name: "about.body", label: "About text", type: "textarea", help: "Leave a blank line between paragraphs." },
      { name: "about.imageUrl", label: "Photo", type: "image" },
    ],
  },
  { id: "contact", label: "Contact & Hours", custom: "hours" },
  {
    id: "social",
    label: "Social",
    fields: [
      { name: "social.instagram", label: "Instagram link", type: "url", placeholder: "https://instagram.com/…" },
      { name: "social.facebook", label: "Facebook link", type: "url" },
      { name: "social.tiktok", label: "TikTok link", type: "url" },
      { name: "social.youtube", label: "YouTube link", type: "url" },
      { name: "social.x", label: "X (Twitter) link", type: "url" },
    ],
  },
  {
    id: "buttons",
    label: "Booking & Shop",
    fields: [
      { name: "booking.label", label: "Booking button text", type: "text" },
      { name: "booking.url", label: "Booking link", type: "url", help: "Your booking app link (Booksy, StyleSeat, Square…), or #services." },
      { name: "booking.showInHeader", label: "Show booking button in the header", type: "checkbox" },
      { name: "servicesOptions.bookLabel", label: "Service “book” button text", type: "text" },
      { name: "servicesOptions.depositLabel", label: "Service Stripe button text", type: "text" },
      { name: "shop.buyLabel", label: "Product buy button text", type: "text" },
      { name: "shop.soldOutLabel", label: "Sold out text", type: "text" },
      { name: "shop.noLinkLabel", label: "Button text when a product has no Stripe link", type: "text" },
      { name: "shop.currency", label: "Currency code", type: "text", placeholder: "USD" },
      { name: "shop.showShopPage", label: "Have a separate Shop page", type: "checkbox" },
      { name: "shop.shopNavLabel", label: "Shop menu label", type: "text" },
    ],
  },
  {
    id: "seo",
    label: "Footer & Google",
    fields: [
      { name: "footer.text", label: "Footer text", type: "text", help: "Leave empty for “© year Business name”." },
      { name: "seo.title", label: "Google title", type: "text", help: "Leave empty for “Business name | Tagline”." },
      { name: "seo.description", label: "Google description", type: "textarea" },
      { name: "seo.ogImageUrl", label: "Image shown when the link is shared", type: "image" },
    ],
  },
];

const CONTACT_FIELDS: FieldDef[] = [
  { name: "contact.phone", label: "Phone", type: "text" },
  { name: "contact.email", label: "Email", type: "text" },
  { name: "contact.address", label: "Address", type: "textarea" },
  { name: "contact.showMap", label: "Show a map of the address", type: "checkbox" },
];

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const o = obj as Record<string, unknown>;
  return { ...o, [head]: rest.length ? setPath(o[head] ?? {}, rest.join("."), value) : value } as T;
}

export function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState(TABS[0].id);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMessage({ kind: "error", text: error.message });
        setSettings(mergeSettings(data?.data));
      });
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!settings) return <p className="muted">Loading…</p>;

  const update = (path: string, value: unknown) => {
    setSettings((s) => setPath(s!, path, value));
    setDirty(true);
  };

  async function save() {
    setSaving(true);
    const { error } = await createClient()
      .from("site_settings")
      .upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) setMessage({ kind: "error", text: error.message });
    else {
      setDirty(false);
      setMessage({ kind: "ok", text: "Saved. Your changes are live on the website." });
    }
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div>
      <div className="page-head sticky-head">
        <div>
          <h1>Site Settings</h1>
          <p className="muted">Business info, colors, fonts, homepage layout and every label on the site.</p>
        </div>
        <button className="btn-admin" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {message && (
        <div className={`notice notice-${message.kind}`} onClick={() => setMessage(null)}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${t.id === tab ? "tab-on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {current.fields && (
          <div className="fields">
            {current.fields.map((f) => (
              <Field key={f.name} def={{ ...f, name: f.name }} value={getPath(settings, f.name)} onChange={(v) => update(f.name, v)} />
            ))}
          </div>
        )}
        {current.id === "theme" && (
          <button
            className="link-btn"
            onClick={() => {
              if (confirm("Reset all colors and fonts to the original look?")) update("theme", DEFAULT_SETTINGS.theme);
            }}
          >
            Reset colors & fonts to default
          </button>
        )}
        {current.custom === "sections" && (
          <SectionsEditor sections={settings.sections} onChange={(s) => update("sections", s)} />
        )}
        {current.custom === "hours" && (
          <>
            <div className="fields">
              {CONTACT_FIELDS.map((f) => (
                <Field key={f.name} def={f} value={getPath(settings, f.name)} onChange={(v) => update(f.name, v)} />
              ))}
            </div>
            <HoursEditor hours={settings.contact.hours} onChange={(h) => update("contact.hours", h)} />
          </>
        )}
      </div>
    </div>
  );
}

function SectionsEditor({ sections, onChange }: { sections: SectionConfig[]; onChange: (s: SectionConfig[]) => void }) {
  const set = (i: number, patch: Partial<SectionConfig>) => onChange(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <p className="muted">Turn sections on or off, change their order, and rename their titles and menu labels.</p>
      <ul className="rows">
        {sections.map((s, i) => (
          <li key={s.key} className={`row row-section ${s.visible ? "" : "row-off"}`}>
            <div className="row-order">
              <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                ▲
              </button>
              <button aria-label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
                ▼
              </button>
            </div>
            <div className="row-main">
              <div className="row-section-top">
                <strong>{SECTION_NAMES[s.key]}</strong>
                <button className={`pill ${s.visible ? "pill-on" : ""}`} onClick={() => set(i, { visible: !s.visible })}>
                  {s.visible ? "Showing" : "Hidden"}
                </button>
              </div>
              <div className="fields fields-inline">
                <Field def={{ name: `${s.key}-nav`, label: "Menu label", type: "text", help: "Empty hides it from the menu." }} value={s.navLabel} onChange={(v) => set(i, { navLabel: v as string })} />
                {s.key !== "hero" && (
                  <>
                    <Field def={{ name: `${s.key}-h`, label: "Title", type: "text" }} value={s.heading} onChange={(v) => set(i, { heading: v as string })} />
                    <Field def={{ name: `${s.key}-sub`, label: "Subtitle", type: "text" }} value={s.subheading} onChange={(v) => set(i, { subheading: v as string })} />
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HoursEditor({ hours, onChange }: { hours: SiteSettings["contact"]["hours"]; onChange: (h: SiteSettings["contact"]["hours"]) => void }) {
  return (
    <div className="hours-editor">
      <h3>Hours</h3>
      {hours.map((h, i) => (
        <div key={i} className="hours-row">
          <input value={h.day} placeholder="Day" onChange={(e) => onChange(hours.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))} />
          <input value={h.hours} placeholder="9am – 6pm or Closed" onChange={(e) => onChange(hours.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} />
          <button className="link-btn danger" onClick={() => onChange(hours.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button className="btn-admin btn-secondary" onClick={() => onChange([...hours, { day: "", hours: "" }])}>
        + Add row
      </button>
    </div>
  );
}
