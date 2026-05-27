-- Rotina Alê · Supabase schema
-- Cola isso no SQL Editor do Supabase e clica Run.
-- Cria 2 tabelas, RLS, índices, e um trigger pra updated_at.

-- ────────────────────────────────────────────────────────────
-- TABLE: sessions
-- Uma linha por (user, data, dia_id) — agrega o estado da sessão de treino
-- ────────────────────────────────────────────────────────────
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  day_id text not null,
  exercises jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date, day_id)
);

create index sessions_user_date_idx on public.sessions (user_id, date desc);

-- ────────────────────────────────────────────────────────────
-- TABLE: exercise_history
-- Última carga usada por exercício (key = "dayId::blockKind::exerciseName")
-- Sugere progressão na próxima sessão
-- ────────────────────────────────────────────────────────────
create table public.exercise_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_key text not null,
  last_load numeric(6,2) not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_key)
);

-- ────────────────────────────────────────────────────────────
-- updated_at trigger
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

create trigger exercise_history_set_updated_at
before update on public.exercise_history
for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- Row Level Security: só o dono acessa seus próprios dados
-- ────────────────────────────────────────────────────────────
alter table public.sessions enable row level security;
alter table public.exercise_history enable row level security;

-- sessions
create policy "users select own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "users insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "users update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- exercise_history
create policy "users select own history"
  on public.exercise_history for select
  using (auth.uid() = user_id);

create policy "users upsert own history"
  on public.exercise_history for insert
  with check (auth.uid() = user_id);

create policy "users update own history"
  on public.exercise_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: device_pairings
-- Short-lived pairing codes used to log G2 device into a user account.
-- User generates a code in the PWA, types/scans it into the G2 app,
-- G2 exchanges code for refresh_token and immediately deletes the row.
-- ────────────────────────────────────────────────────────────
create table public.device_pairings (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  refresh_token text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 minutes')
);

create index device_pairings_expires_idx on public.device_pairings (expires_at);

alter table public.device_pairings enable row level security;

-- Owner can create their own pairing row
create policy "users insert own pairings"
  on public.device_pairings for insert
  with check (auth.uid() = user_id);

-- Anyone with a valid (non-expired) code can read it (G2 isn't authed yet)
create policy "anyone can read by valid code"
  on public.device_pairings for select
  using (now() < expires_at);

-- Anyone can delete a pairing (G2 consumes it once paired)
create policy "anyone can delete pairing"
  on public.device_pairings for delete
  using (true);

-- Garbage collection: drop expired rows periodically (optional)
create or replace function public.cleanup_expired_pairings()
returns void language plpgsql security definer as $$
begin
  delete from public.device_pairings where expires_at < now();
end;
$$;

-- ────────────────────────────────────────────────────────────
-- Realtime: ativar streaming de mudanças via WebSocket
-- ────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.exercise_history;
