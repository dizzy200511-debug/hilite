-- AI usage for the owner dashboard. Run after 0002_ai.sql.
-- Totals only: no user ids or emails leave the database, just counts per day.

create function public.owner_ai_stats() returns json
language plpgsql stable security definer set search_path = public as $$
declare result json;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_owner) then
    raise exception 'Not allowed';
  end if;
  select json_build_object(
    'today', (select coalesce(sum(count), 0) from public.ai_usage where day = current_date),
    'week', (select coalesce(sum(count), 0) from public.ai_usage where day > current_date - 7),
    'month', (select coalesce(sum(count), 0) from public.ai_usage where day > current_date - 30),
    'users_week', (select count(distinct user_id) from public.ai_usage where day > current_date - 7),
    -- The heaviest single account today, to judge whether AI_DAILY_LIMIT is right.
    'max_today', (select coalesce(max(count), 0) from public.ai_usage where day = current_date),
    'by_day', (
      select json_agg(json_build_object('day', d::date, 'n', coalesce(c.n, 0)) order by d)
      from generate_series(current_date - 29, current_date, interval '1 day') d
      left join (select day, sum(count) n from public.ai_usage group by day) c on c.day = d::date
    )
  ) into result;
  return result;
end $$;

revoke all on function public.owner_ai_stats() from public, anon;
grant execute on function public.owner_ai_stats() to authenticated;
