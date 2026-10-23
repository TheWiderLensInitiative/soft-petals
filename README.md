# Salon website + owner dashboard

Next.js site for a natural hair & weave business. Everything visitors see is stored in Supabase
and edited by the owner at `/admin`: business info, logo, colors, fonts, homepage section order and
titles, contact info and hours, socials, services, products (each with its own Stripe Payment Link),
gallery, reviews, FAQ/policies, and deals (top banner, popup, or both, with optional dates).

## Setup

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable (anon) key.
3. In Supabase → Authentication, turn off public sign-ups, then add the owner as a user.
4. Make that user an admin:
   `insert into public.admins (user_id) select id from auth.users where email = 'owner@example.com';`
5. Supabase → Authentication → URL Configuration: set Site URL to the live domain and add
   `https://YOUR-DOMAIN/auth/callback` to the redirect URLs (used by password reset).
6. `npm run dev` locally, or deploy on Vercel with the same two env vars.

## Stripe

The site does not hold Stripe keys. The owner creates a Payment Link per product (or a deposit link
per service) in Stripe and pastes it into the item in the dashboard; the buy button goes to it.
Coupon codes shown in deals must also be created in Stripe and allowed on the Payment Link.
