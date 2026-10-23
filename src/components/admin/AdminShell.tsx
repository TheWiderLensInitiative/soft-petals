"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COLLECTIONS } from "./collections";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/settings", label: "Site Settings" },
  ...["products", "promotions", "gallery", "testimonials", "faqs", "services"].map((k) => ({
    href: `/admin/${k}`,
    label: COLLECTIONS[k].label,
  })),
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
      setIsAdmin(Boolean(row));
    });
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-head">
          <Link href="/admin" className="sidebar-title">
            Dashboard
          </Link>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            ☰
          </button>
        </div>
        <nav>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : ""}>
              {n.label}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
        </nav>
        <div className="sidebar-foot">
          <small>{email}</small>
          <Link href="/admin/password" className="link-btn">
            Change password
          </Link>
          <button className="link-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {isAdmin === false && (
          <div className="notice notice-error">
            This account isn&apos;t set up as an admin yet, so changes won&apos;t save. Ask your web developer to add it.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
