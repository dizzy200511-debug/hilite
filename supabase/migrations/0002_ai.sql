-- Hilite Pro AI features. Run after 0001_init.sql.
--
-- Only a per-day request count is stored, to cap use (and cost) per account.
-- The questions, answers and notes sent to the AI are never stored server-side.

create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
-- No policies: only the `ai` edge function (service role) reads or writes this.

-- Counts one request and says whether it's within today's limit. Atomic, so parallel requests can't slip past.
create function public.ai_take(p_user uuid, p_limit int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.ai_usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into n;
  return n <= p_limit;
end $$;

revoke all on function public.ai_take(uuid, int) from public, anon, authenticated;
grant execute on function public.ai_take(uuid, int) to service_role;

-- Old counts aren't needed. Run occasionally, or schedule it with pg_cron:
--   delete from public.ai_usage where day < current_date - 30;
