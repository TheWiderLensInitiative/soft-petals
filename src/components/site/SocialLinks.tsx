import type { SiteSettings } from "@/lib/types";
import { SmartLink } from "./SmartLink";

const LABELS: Record<keyof SiteSettings["social"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
};

export function SocialLinks({ social }: { social: SiteSettings["social"] }) {
  const entries = (Object.keys(LABELS) as (keyof typeof LABELS)[]).filter((k) => social[k]);
  if (!entries.length) return null;
  return (
    <div className="social">
      {entries.map((k) => (
        <SmartLink key={k} href={social[k]} className="social-link">
          {LABELS[k]}
        </SmartLink>
      ))}
    </div>
  );
}
