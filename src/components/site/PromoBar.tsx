"use client";

import { useEffect, useState } from "react";
import type { Promotion } from "@/lib/types";
import { safeColor } from "@/lib/safe";
import { SmartLink } from "./SmartLink";

const KEY = "promo-bar-dismissed";

export function PromoBar({ promotions }: { promotions: Promotion[] }) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const signature = promotions.map((p) => p.id + p.updated_at).join("|");

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(KEY) === signature);
    } catch {}
  }, [signature]);

  useEffect(() => {
    if (promotions.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % promotions.length), 6000);
    return () => clearInterval(t);
  }, [promotions.length]);

  if (!promotions.length || hidden) return null;
  const p = promotions[index % promotions.length];

  return (
    <div
      className="promo-bar"
      style={{
        background: safeColor(p.bg_color, "var(--primary)"),
        color: safeColor(p.text_color, "var(--primary-text)"),
      }}
    >
      <div className="container promo-bar-inner">
        <span>
          {p.message || p.title}
          {p.code && (
            <>
              {" "}
              Use code <strong className="promo-code">{p.code}</strong>
            </>
          )}
        </span>
        {p.button_label && (
          <SmartLink href={p.button_url} className="promo-bar-link">
            {p.button_label}
          </SmartLink>
        )}
      </div>
      <button
        className="promo-bar-close"
        aria-label="Dismiss"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(KEY, signature);
          } catch {}
        }}
      >
        ×
      </button>
    </div>
  );
}
