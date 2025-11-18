-- Create a simple single-row settings table for venue profile
create table if not exists public.venue_settings (
  id text primary key,
  instagram_url text,
  facebook_url text,
  website_url text,
  address text,
  updated_at timestamptz default now()
);

-- Ensure a default row exists (optional; safe to run multiple times)
insert into public.venue_settings (id)
values ('default')
on conflict (id) do nothing;