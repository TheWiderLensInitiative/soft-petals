# Soft Petals: handoff for setup and launch

Soft Petals sells 100% raw/natural human hair (bundles, wigs, closures, frontals, weave). It is a
shop, not a salon. The site is finished in code; what's left is accounts, database, deploy, and
the owner's login. Read README.md for what the site does.

## State when handed over (2026-10-23)

- Next.js 15 (App Router, TypeScript), Supabase (database, auth, image storage), no Stripe keys.
- `npx tsc --noEmit`, `npm run lint` and `next build` all pass.
- Checked visually on default settings (no database) at desktop and phone width.
- **Never run against a real Supabase project yet.** The dashboard's saving, uploads and login
  have not been exercised; test them (checklist below).
- Brand defaults (logo, black/pink/gold colors, fonts) are in `src/lib/defaults.ts` and
  `public/brand/`. The owner can override all of it from the dashboard.

## Setup steps

1. `npm install`
2. Create a Supabase project. In the SQL editor, run `supabase/migrations/0001_init.sql`
   (tables, row-level security, `media` storage bucket, `is_admin()`).
3. Supabase → Authentication → Sign In / Providers: **turn off "Allow new users to sign up"**.
   The admin tables are protected by the `admins` list, but sign-ups should still be closed.
4. Authentication → Users → Add user: the owner's email and a temporary password.
5. Make the owner an admin (SQL editor):
   `insert into public.admins (user_id) select id from auth.users where email = 'OWNER_EMAIL';`
6. Create `.env.local` from `.env.example` with the project URL and the publishable (anon) key.
   Optional: `NEXT_PUBLIC_SITE_URL=https://the-live-domain` (used for share previews; on Vercel
   it falls back to the production URL automatically).
7. Deploy to Vercel with the same env vars (framework: Next.js, no build settings needed).
8. Supabase → Authentication → URL Configuration: Site URL = the live domain; add
   `https://THE-LIVE-DOMAIN/auth/callback` to Redirect URLs (password reset needs it).
9. If she has a domain, add it in Vercel and point DNS there.

## Test checklist (do these on the deployed site)

- [ ] `/admin` redirects to `/admin/login` when signed out; owner can sign in.
- [ ] Overview page loads with counts and no "isn't set up as an admin" warning.
- [ ] Site Settings: change a color and the business name, save, reload `/`: both changed.
- [ ] Upload an image (e.g. About photo): it previews in the dashboard and shows on the site.
- [ ] Products: add one with a price and a Stripe link → shows in Shop; Buy opens the link.
- [ ] Product with options (e.g. 14", 16", 18", each its own price + link): the dropdown changes
      the price and the Buy link.
- [ ] Reorder with ▲▼, hide/show, delete: all reflected on the site.
- [ ] Deals & Popups: a "Banner + popup" deal with a code shows the top bar and the popup;
      dismissing works; an end date in the past makes it disappear.
- [ ] Forgot password email arrives and the link lets her set a new password.
- [ ] Signed out, try writing via the API with the anon key: it must be refused (RLS).

## Owner notes

- Stripe: for each product (or each length) she creates a Payment Link in Stripe and pastes it
  into the product. Coupon codes shown in deals must also be created in Stripe and "Allow
  promotion codes" turned on for those Payment Links.
- Empty sections (shop, gallery, reviews, FAQ, contact) stay hidden until she adds content.
- The Services section is off by default (Site Settings → Homepage Layout) in case she ever
  offers installs.
