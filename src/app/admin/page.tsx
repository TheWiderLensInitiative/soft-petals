import Link from "next/link";
import { COLLECTIONS } from "@/components/admin/collections";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const supabase = await createClient();
  const keys = ["promotions", "products", "services", "gallery", "testimonials", "faqs"];
  const counts = await Promise.all(
    keys.map((k) => supabase.from(COLLECTIONS[k].table).select("id", { count: "exact", head: true }).eq("active", true)),
  );
  const { count: missingStripe } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("active", true)
    .eq("stripe_link", "");

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Welcome back</h1>
          <p className="muted">Everything on your website can be changed from here. Changes go live as soon as you save.</p>
        </div>
      </div>
      {Boolean(missingStripe) && (
        <div className="notice notice-error">
          {missingStripe} product{missingStripe === 1 ? " has" : "s have"} no Stripe link yet, so customers can&apos;t buy{" "}
          {missingStripe === 1 ? "it" : "them"} online. <Link href="/admin/products">Fix in Products</Link>
        </div>
      )}
      <div className="cards">
        <Link href="/admin/settings" className="panel stat">
          <strong>Site Settings</strong>
          <small>Colors, fonts, logo, contact info, hours, homepage layout</small>
        </Link>
        {keys.map((k, i) => (
          <Link key={k} href={`/admin/${k}`} className="panel stat">
            <span className="stat-num">{counts[i].count ?? 0}</span>
            <strong>{COLLECTIONS[k].label}</strong>
            <small>{k === "promotions" ? "turned on" : "showing on site"}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
