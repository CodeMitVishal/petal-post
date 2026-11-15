-- Petal Post public wall.
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
--
-- What is stored: first names of sender and recipient, the occasion and which flowers.
-- Never the note, the link or the surprise date. Only senders who tick
-- "Add to the public wall" are recorded.

create table if not exists public.gifts (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  sender     text not null check (sender    ~ '^[[:alpha:]][[:alpha:] .''-]{0,19}$'),
  recipient  text not null check (recipient ~ '^[[:alpha:]][[:alpha:] .''-]{0,19}$'),
  occasion   text check (occasion is null or occasion in ('love','birthday','thanks','sorry','getwell','congrats','sympathy','just')),
  stems      smallint not null check (stems between 1 and 12),
  flowers    text not null check (flowers ~ '^[a-z]{2}(\.[a-z]{2}){0,11}$')
);

create index if not exists gifts_pair_idx on public.gifts (lower(sender), lower(recipient));
create index if not exists gifts_created_idx on public.gifts (created_at desc);

-- Visitors may add a gift but can't read, edit or delete raw rows.
grant usage on schema public to anon, authenticated;
alter table public.gifts enable row level security;
drop policy if exists "anyone can add a gift" on public.gifts;
create policy "anyone can add a gift" on public.gifts for insert to anon with check (true);
revoke all on public.gifts from anon;
grant insert (sender, recipient, occasion, stems, flowers) on public.gifts to anon;

-- Totals for the counters.
create or replace function public.gift_stats()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'bouquets',   count(*),
    'stems',      coalesce(sum(stems), 0),
    'senders',    count(distinct lower(sender)),
    'recipients', count(distinct lower(recipient))
  ) from gifts;
$$;

-- Who sent whom: one row per sender → recipient pair, with how many times and how many stems.
create or replace function public.gift_wall(max_rows int default 24)
returns table (sender text, recipient text, times bigint, stems bigint, flowers text, occasion text, last_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select (array_agg(g.sender    order by g.created_at desc))[1],
         (array_agg(g.recipient order by g.created_at desc))[1],
         count(*),
         sum(g.stems),
         (array_agg(g.flowers   order by g.created_at desc))[1],
         (array_agg(g.occasion  order by g.created_at desc))[1],
         max(g.created_at)
  from gifts g
  group by lower(g.sender), lower(g.recipient)
  order by max(g.created_at) desc
  limit least(greatest(coalesce(max_rows, 24), 1), 200);
$$;

revoke all on function public.gift_stats() from public;
revoke all on function public.gift_wall(int) from public;
grant execute on function public.gift_stats() to anon, authenticated;
grant execute on function public.gift_wall(int) to anon, authenticated;
