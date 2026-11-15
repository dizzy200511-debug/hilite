-- Hilite database. Run once in the Supabase SQL editor (or `supabase db push`).
--
-- Security model
--  * Every table has Row Level Security on. The browser can only ever touch its own rows.
--  * Revision data (user_docs) also needs a trusted device: the app sends a random device id
--    in the x-device-id header, and the row is only readable if that device was confirmed
--    with an emailed code. A stolen password alone can't read anyone's data.
--  * Plan, owner flag and device codes can only be changed by the server (service role).
--  * Supabase talks to Postgres with parameterised queries, so values are never spliced into SQL.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  is_owner boolean not null default false,
  stripe_customer text,
  pro_period text check (pro_period in ('month', 'year')),
  pro_until timestamptz,
  created_at timestamptz not null default now(),
  last_active timestamptz
);
alter table public.profiles enable row level security;
create policy "Read your own profile" on public.profiles for select using (id = auth.uid());
-- No insert/update/delete policies: only the server changes plans.

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- devices
create table public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_hash text not null check (device_hash ~ '^[0-9a-f]{64}$'),
  name text not null default 'Device' check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (user_id, device_hash)
);
create index on public.trusted_devices (user_id);
alter table public.trusted_devices enable row level security;

-- SHA-256 of the x-device-id header on this request. The raw id never leaves the device's storage.
create function public.request_device_hash() returns text
language sql stable set search_path = public, extensions as $$
  select encode(extensions.digest(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-device-id', ''), 'sha256'), 'hex')
$$;

create function public.device_trusted() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trusted_devices
    where user_id = auth.uid() and device_hash = public.request_device_hash()
  )
$$;

create policy "See your own devices" on public.trusted_devices for select using (user_id = auth.uid());
create policy "Remove your devices from a trusted device" on public.trusted_devices for delete
  using (user_id = auth.uid() and public.device_trusted());
-- Devices are only added by the `device` edge function after a correct emailed code.

create function public.touch_device(p_hash text) returns void
language sql security definer set search_path = public as $$
  update public.trusted_devices set last_seen = now() where user_id = auth.uid() and device_hash = p_hash;
  update public.profiles set last_active = now() where id = auth.uid();
$$;

-- Codes for confirming a new device. Server-only: RLS on, no policies.
create table public.device_codes (
  user_id uuid not null references auth.users (id) on delete cascade,
  device_hash text not null,
  device_name text not null default 'Device',
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, device_hash)
);
alter table public.device_codes enable row level security;

create table public.code_sends (
  user_id uuid not null references auth.users (id) on delete cascade,
  sent_at timestamptz not null default now()
);
create index on public.code_sends (user_id, sent_at);
alter table public.code_sends enable row level security;

-- ---------------------------------------------------------------- revision data
create table public.user_docs (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (key ~ '^[a-zA-Z0-9_-]{1,80}$'),
  data jsonb,
  updated_at bigint not null,
  deleted boolean not null default false,
  primary key (user_id, key),
  constraint doc_size check (pg_column_size(data) <= 600000)
);
alter table public.user_docs enable row level security;
create policy "Your docs, from a trusted device" on public.user_docs for all
  using (user_id = auth.uid() and public.device_trusted())
  with check (user_id = auth.uid() and public.device_trusted());

-- Stop one account filling the database.
create function public.limit_docs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.user_docs where user_id = new.user_id) >= 2000 then
    raise exception 'Too many items in this account';
  end if;
  return new;
end $$;
create trigger user_docs_limit before insert on public.user_docs
  for each row execute function public.limit_docs();

-- ---------------------------------------------------------------- owner dashboard
-- Counts only. Never returns emails or anyone's content.
create function public.owner_stats() returns json
language plpgsql stable security definer set search_path = public as $$
declare result json;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_owner) then
    raise exception 'Not allowed';
  end if;
  select json_build_object(
    'users', (select count(*) from public.profiles),
    'pro', (select count(*) from public.profiles where plan = 'pro'),
    'new_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'active_7d', (select count(*) from public.profiles where last_active > now() - interval '7 days'),
    'active_1d', (select count(*) from public.profiles where last_active > now() - interval '1 day'),
    'docs', (select count(*) from public.user_docs),
    'signups_by_day', (
      select json_agg(json_build_object('day', d::date, 'n', coalesce(c.n, 0)) order by d)
      from generate_series(current_date - 29, current_date, interval '1 day') d
      left join (select created_at::date day, count(*) n from public.profiles group by 1) c on c.day = d::date
    )
  ) into result;
  return result;
end $$;

-- Only signed-in users may call these, and the functions check ownership themselves.
revoke all on function public.owner_stats() from public, anon;
revoke all on function public.touch_device(text) from public, anon;
grant execute on function public.owner_stats() to authenticated;
grant execute on function public.touch_device(text) to authenticated;

-- To make yourself the owner, after signing up run:
--   update public.profiles set is_owner = true
--   where id = (select id from auth.users where email = 'you@example.com');
