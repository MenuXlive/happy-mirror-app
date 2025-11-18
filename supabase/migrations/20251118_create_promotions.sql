-- Create promotions table for persistent preset and custom offers
create table if not exists public.promotions (
  key text primary key,
  title text not null,
  description text,
  category text not null check (category in ('beer','food','drinks','alcohol','general')),
  active boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Helpful index for active promotions
create index if not exists promotions_active_idx on public.promotions (active);