-- Soft Petals site schema: everything on the public site comes from these tables.
-- Public visitors can read; only users listed in public.admins can write.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- One row holding brand, theme, fonts, contact, hours, socials, homepage sections, SEO, footer.
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id, data) values (1, '{}'::jsonb);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2),
  compare_at_price numeric(10, 2),
  category text not null default '',
  image_url text not null default '',
  stripe_link text not null default '',
  -- Optional choices such as lengths: [{label, price, stripe_link, in_stock}]
  variants jsonb not null default '[]'::jsonb,
  in_stock boolean not null default true,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_text text not null default '',
  duration text not null default '',
  category text not null default '',
  image_url text not null default '',
  stripe_link text not null default '',
  booking_url text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  image_url text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Deals: shown as a top bar, a popup, or both, optionally between two dates.
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null default '',
  code text not null default '',
  button_label text not null default '',
  button_url text not null default '',
  display text not null default 'bar' check (display in ('bar', 'popup', 'both')),
  bg_color text not null default '',
  text_color text not null default '',
  image_url text not null default '',
  popup_delay_seconds int not null default 3,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['site_settings','products','services','gallery','testimonials','faqs','promotions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter table public.admins enable row level security;
create policy "admin reads admins" on public.admins for select to authenticated using (public.is_admin());

create policy "public read" on public.site_settings for select using (true);
create policy "public read active" on public.products for select using (active or public.is_admin());
create policy "public read active" on public.services for select using (active or public.is_admin());
create policy "public read active" on public.gallery for select using (active or public.is_admin());
create policy "public read active" on public.testimonials for select using (active or public.is_admin());
create policy "public read active" on public.faqs for select using (active or public.is_admin());
create policy "public read active" on public.promotions for select using (active or public.is_admin());

-- Image uploads from the dashboard.
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

create policy "admin upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
