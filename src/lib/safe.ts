// The dashboard writes these values straight into CSS and links, so they are checked before use.

export function safeColor(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  if (/^(rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(v)) return v;
  return fallback;
}

export function safeFont(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return /^[A-Za-z0-9 ]{1,60}$/.test(v) ? v : fallback;
}

export function safeUrl(value: string | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (v.startsWith("#") || v.startsWith("/")) return v;
  if (/^(https?:|mailto:|tel:|sms:)/i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+/.test(v)) return `https://${v}`;
  return "";
}

export function isExternal(url: string): boolean {
  return /^https?:/i.test(url);
}

export function formatPrice(amount: number | null, currency: string): string {
  if (amount === null || amount === undefined) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}
