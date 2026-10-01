-- SkyForge — multiplayer backend (Supabase / Postgres 17)
-- One row per room. Clients run the shared rules engine and write the next state with an
-- optimistic version check; every client subscribes to Realtime changes on its room row.

create table if not exists public.rooms (
  code        text primary key check (code ~ '^[A-Z0-9]{4,8}$'),
  state       jsonb not null,
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint rooms_state_size check (pg_column_size(state) < 300000)
);
create index if not exists rooms_updated_idx on public.rooms (updated_at);

-- Enforce strictly sequential versions (no blind overwrites) and stamp updated_at.
create or replace function public.rooms_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.version <> old.version + 1 then
    raise exception 'version conflict (expected %, got %)', old.version + 1, new.version;
  end if;
  if new.code <> old.code then
    raise exception 'room code is immutable';
  end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists rooms_guard on public.rooms;
create trigger rooms_guard before update on public.rooms
  for each row execute function public.rooms_guard();

alter table public.rooms enable row level security;
drop policy if exists rooms_select on public.rooms;
drop policy if exists rooms_insert on public.rooms;
drop policy if exists rooms_update on public.rooms;
create policy rooms_select on public.rooms for select to anon, authenticated using (true);
create policy rooms_insert on public.rooms for insert to anon, authenticated with check (version = 1);
create policy rooms_update on public.rooms for update to anon, authenticated using (true) with check (true);
-- No delete policy: clients cannot delete rooms (old rooms are purged by cleanup_old_rooms()).

grant select, insert, update on public.rooms to anon, authenticated;

-- Anonymous match results for playtest analytics (no names stored).
create table if not exists public.match_results (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  mode        text check (mode in ('local', 'online')),
  crews       smallint check (crews between 2 and 6),
  duration_s  integer check (duration_s between 0 and 86400),
  data        jsonb not null,
  constraint match_results_size check (pg_column_size(data) < 60000)
);
alter table public.match_results enable row level security;
drop policy if exists results_insert on public.match_results;
drop policy if exists results_select on public.match_results;
create policy results_insert on public.match_results for insert to anon, authenticated with check (true);
create policy results_select on public.match_results for select to anon, authenticated using (true);
grant select, insert on public.match_results to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Server clock, used by clients to agree on turn deadlines.
create or replace function public.server_now() returns timestamptz
language sql stable set search_path = '' as $$ select now() $$;
grant execute on function public.server_now() to anon, authenticated;

-- Housekeeping, called daily by the GitHub Actions keep-alive workflow.
create or replace function public.cleanup_old_rooms() returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  delete from public.rooms where updated_at < now() - interval '3 days';
  get diagnostics n = row_count;
  return n;
end; $$;
revoke all on function public.cleanup_old_rooms() from public;
grant execute on function public.cleanup_old_rooms() to anon, authenticated;

-- Realtime: broadcast row changes to subscribed clients.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms') then
    alter publication supabase_realtime add table public.rooms;
  end if;
end $$;
