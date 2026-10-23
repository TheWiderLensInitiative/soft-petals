import { isExternal, safeUrl } from "@/lib/safe";

/** Link that opens outside sites in a new tab and drops anything that isn't a real URL. */
export function SmartLink({
  href,
  className,
  children,
  style,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const url = safeUrl(href);
  if (!url) return null;
  // Section anchors work from every page.
  const resolved = url.startsWith("#") ? `/${url}` : url;
  const external = isExternal(resolved);
  return (
    <a
      href={resolved}
      className={className}
      style={style}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
