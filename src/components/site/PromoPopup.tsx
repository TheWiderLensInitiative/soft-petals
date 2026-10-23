"use client";

import { useEffect, useState } from "react";
import type { Promotion } from "@/lib/types";
import { safeColor } from "@/lib/safe";
import { SmartLink } from "./SmartLink";

/** Shows the first live popup deal once per browser session (again if the owner edits it). */
export function PromoPopup({ promotions }: { promotions: Promotion[] }) {
  const p = promotions[0];
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = p ? `promo-popup-${p.id}-${p.updated_at}` : "";

  useEffect(() => {
    if (!p) return;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), Math.max(0, p.popup_delay_seconds) * 1000);
    return () => clearTimeout(t);
  }, [p, key]);

  if (!p || !open) return null;

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(key, "1");
    } catch {}
  };

  return (
    <div className="popup-backdrop" onClick={close}>
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: safeColor(p.bg_color, "var(--surface)"),
          color: safeColor(p.text_color, "var(--text)"),
        }}
      >
        <button className="popup-close" aria-label="Close" onClick={close}>
          ×
        </button>
        {p.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt="" className="popup-image" />
        )}
        <div className="popup-body">
          <h2>{p.title}</h2>
          {p.message && <p>{p.message}</p>}
          {p.code && (
            <button
              className="popup-code"
              onClick={() => {
                navigator.clipboard?.writeText(p.code).then(() => setCopied(true), () => {});
              }}
            >
              {p.code} <small>{copied ? "Copied!" : "Tap to copy"}</small>
            </button>
          )}
          {p.button_label && (
            <SmartLink href={p.button_url} className="btn btn-primary">
              {p.button_label}
            </SmartLink>
          )}
        </div>
      </div>
    </div>
  );
}
