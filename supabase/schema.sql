-- Petal Post: public flower wall + photo storage.
-- Run in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: it upgrades an existing project in place.
--
-- Stored per wall entry: first names, occasion, flower codes and optional photo ids.
-- Never the note, the link or the surprise date. Gift photos live in the "photos"
-- bucket under unguessable random names; nobody can list the bucket.

-------------------------------------------------------------------------------
-- 1. Wall table
-------------------------------------------------------------------------------
create table if not exists public.gifts (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  sender     text not null check (sender    ~ '^[[:alpha:]][[:alpha:] .''-]{0,19}$'),
  recipient  text not null check (recipient ~ '^[[:alpha:]][[:alpha:] .''-]{0,19}$'),
  occasion   text check (occasion is null or occasion in ('love','birthday','thanks','sorry','getwell','congrats','sympathy','just')),
  stems      smallint not null check (stems between 1 and 24),
  flowers    text not null check (flowers ~ '^[a-z]{2}(\.[a-z]{2}){0,23}$')
);
alter table public.gifts add column if not exists sender_photo    uuid;
alter table public.gifts add column if not exists recipient_photo uuid;
alter table public.gifts add column if not exists ip_hash         text;
-- Anonymous per-browser id: keeps two different people with the same first names apart
-- on the wall, and gives each browser its own rate limit (not shared with the whole Wi-Fi).
alter table public.gifts add column if not exists sender_key      uuid;

-- Grand bouquets hold up to 24 stems (re-applied so older projects upgrade in place).
alter table public.gifts drop constraint if exists gifts_stems_check;
alter table public.gifts add constraint gifts_stems_check check (stems between 1 and 24);
alter table public.gifts drop constraint if exists gifts_flowers_check;
alter table public.gifts add constraint gifts_flowers_check check (flowers ~ '^[a-z]{2}(\.[a-z]{2}){0,23}$');

create index if not exists gifts_pair_idx    on public.gifts (lower(sender), lower(recipient));
create index if not exists gifts_created_idx on public.gifts (created_at desc);
create index if not exists gifts_ip_idx      on public.gifts (ip_hash, created_at desc);
create index if not exists gifts_key_idx     on public.gifts (sender_key, created_at desc);

-- Visitors may add a gift but can't read, edit or delete rows.
grant usage on schema public to anon, authenticated;
alter table public.gifts enable row level security;
drop policy if exists "anyone can add a gift" on public.gifts;
create policy "anyone can add a gift" on public.gifts for insert to anon, authenticated with check (true);
revoke all on public.gifts from anon, authenticated;
grant insert (sender, recipient, occasion, stems, flowers, sender_photo, recipient_photo, sender_key) on public.gifts to anon, authenticated;

-------------------------------------------------------------------------------
-- 2. Rate limits, per person rather than per network:
--      6 wall entries per browser (sender_key) per 10 minutes,
--      30 per IP per 10 minutes (loose backstop, so an office or mobile network
--      shared by many people isn't blocked by one busy sender),
--      60 per minute overall.
--    The IP is only kept as a salted hash; the raw IP is never stored.
-------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.secrets (k text primary key, v text not null);
alter table private.secrets enable row level security; -- no policies: only the owner (definer functions) can read it
insert into private.secrets (k, v)
values ('ip_salt', md5(random()::text || clock_timestamp()::text || random()::text))
on conflict (k) do nothing;
revoke all on private.secrets from public, anon, authenticated;

create or replace function private.gifts_guard()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  hdrs   json := nullif(current_setting('request.headers', true), '')::json;
  ip     text := trim(split_part(coalesce(hdrs ->> 'cf-connecting-ip', hdrs ->> 'x-forwarded-for', hdrs ->> 'x-real-ip', ''), ',', 1));
  recent int;
begin
  select count(*) into recent from public.gifts where created_at > now() - interval '1 minute';
  if recent >= 60 then
    raise exception 'The flower wall is busy, please try again in a minute.' using errcode = 'P0001';
  end if;
  if new.sender_key is not null then
    select count(*) into recent from public.gifts
      where sender_key = new.sender_key and created_at > now() - interval '10 minutes';
    if recent >= 6 then
      raise exception 'You''ve shared lots of bouquets just now, please wait a few minutes.' using errcode = 'P0001';
    end if;
  end if;
  if ip <> '' then
    new.ip_hash := md5(ip || (select v from private.secrets where k = 'ip_salt'));
    select count(*) into recent from public.gifts
      where ip_hash = new.ip_hash and created_at > now() - interval '10 minutes';
    if recent >= (case when new.sender_key is null then 6 else 30 end) then
      raise exception 'Lots of bouquets are coming from your network right now, please try again in a few minutes.' using errcode = 'P0001';
    end if;
  else
    new.ip_hash := null;
  end if;
  new.created_at := now();
  return new;
end;
$$;
revoke all on function private.gifts_guard() from public;

drop trigger if exists gifts_guard on public.gifts;
create trigger gifts_guard before insert on public.gifts
for each row execute function private.gifts_guard();

-------------------------------------------------------------------------------
-- 3. Read-only summaries for the site
-------------------------------------------------------------------------------
create or replace function public.gift_stats()
returns json
language sql stable security definer set search_path = ''
as $$
  select json_build_object(
    'bouquets',   count(*),
    'stems',      coalesce(sum(stems), 0),
    'senders',    count(distinct coalesce(sender_key::text, lower(sender))),
    'recipients', count(distinct lower(recipient))
  ) from public.gifts;
$$;

-- One row per person → recipient: the same first names sent from two different browsers
-- are two different rows. "pair" is an opaque key for the page (never the sender_key).
drop function if exists public.gift_wall(int);
create function public.gift_wall(max_rows int default 24)
returns table (pair text, sender text, recipient text, times bigint, stems bigint, flowers text, occasion text,
               last_at timestamptz, sender_photo uuid, recipient_photo uuid)
language sql stable security definer set search_path = ''
as $$
  select left(md5(coalesce(g.sender_key::text, '-') || '|' || lower(g.sender) || '|' || lower(g.recipient)), 16),
         (array_agg(g.sender    order by g.created_at desc))[1],
         (array_agg(g.recipient order by g.created_at desc))[1],
         count(*),
         sum(g.stems),
         (array_agg(g.flowers   order by g.created_at desc))[1],
         (array_agg(g.occasion  order by g.created_at desc))[1],
         max(g.created_at),
         (array_agg(g.sender_photo    order by g.created_at desc) filter (where g.sender_photo    is not null))[1],
         (array_agg(g.recipient_photo order by g.created_at desc) filter (where g.recipient_photo is not null))[1]
  from public.gifts g
  group by g.sender_key, lower(g.sender), lower(g.recipient)
  order by max(g.created_at) desc
  limit least(greatest(coalesce(max_rows, 24), 1), 200);
$$;

revoke all on function public.gift_stats()     from public;
revoke all on function public.gift_wall(int)   from public;
grant execute on function public.gift_stats()   to anon, authenticated;
grant execute on function public.gift_wall(int) to anon, authenticated;

-------------------------------------------------------------------------------
-- 4. Photo storage: public-read bucket, JPEG only, max 1 MB, random names only,
--    upload-only for visitors (no list, overwrite or delete), 20/min and 400/day overall.
-------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 1048576, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.photo_upload_allowed()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select count(*) from storage.objects where bucket_id = 'photos' and created_at > now() - interval '1 minute') < 20
     and (select count(*) from storage.objects where bucket_id = 'photos' and created_at > now() - interval '1 day')    < 400;
$$;
revoke all on function private.photo_upload_allowed() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.photo_upload_allowed() to anon, authenticated;

drop policy if exists "petal post photo uploads" on storage.objects;
create policy "petal post photo uploads" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'photos'
    and name ~ '^(g|a)/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$'
    and private.photo_upload_allowed()
  );
