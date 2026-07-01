-- ============================================================================
-- NORVO · Fase 6 — Plano Pessoa Física (PF) — F3: schema + RLS
--
-- Novos recursos pessoais: categorias personalizadas + snapshots de patrimônio.
-- 100% ADITIVA (não altera nada existente). Isolamento total por usuário via
-- RLS (user_id = auth.uid()). Mesmo padrão da 0010/0011.
--
-- Transacional · idempotente (safe re-run). Pré-requisito: 0001 (set_updated_at),
-- 0010 (personal_profiles). Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 1) personal_categories — categorias criadas pelo usuário ─────────────────
create table if not exists public.personal_categories (
  id         text primary key default gen_random_uuid()::text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text not null default 'despesa',   -- receita|despesa|ambos
  color      text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 2) personal_net_worth_snapshots — patrimônio líquido por competência ─────
--    snapshot_date = 1º dia do mês; unique (user_id, snapshot_date) permite
--    upsert mensal (atualiza o mês corrente, congela os anteriores).
create table if not exists public.personal_net_worth_snapshots (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references auth.users(id) on delete cascade,
  snapshot_date     date not null,
  accounts_total    numeric not null default 0,
  investments_total numeric not null default 0,
  debts_total       numeric not null default 0,
  net_worth         numeric not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create index if not exists idx_personal_categories_user on public.personal_categories(user_id);
create index if not exists idx_personal_nws_user         on public.personal_net_worth_snapshots(user_id, snapshot_date);

-- ── 3) Triggers updated_at (função set_updated_at já existe — 0001) ──────────
do $$
declare t text;
begin
  foreach t in array array['personal_categories','personal_net_worth_snapshots'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ── 4) RLS — isolamento total por usuário (user_id = auth.uid()) ─────────────
alter table public.personal_categories            enable row level security;
alter table public.personal_net_worth_snapshots   enable row level security;

do $$
declare t text; pol record;
begin
  foreach t in array array['personal_categories','personal_net_worth_snapshots'] loop
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format($f$create policy %1$s_select on public.%1$s for select to authenticated
                     using (user_id = auth.uid())$f$, t);
    execute format($f$create policy %1$s_insert on public.%1$s for insert to authenticated
                     with check (user_id = auth.uid())$f$, t);
    execute format($f$create policy %1$s_update on public.%1$s for update to authenticated
                     using (user_id = auth.uid()) with check (user_id = auth.uid())$f$, t);
    execute format($f$create policy %1$s_delete on public.%1$s for delete to authenticated
                     using (user_id = auth.uid())$f$, t);
  end loop;
end $$;

grant select, insert, update, delete
  on public.personal_categories, public.personal_net_worth_snapshots
  to authenticated;

commit;

-- ============================================================================
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- select tablename, count(*) as policies from pg_policies
-- where schemaname='public'
--   and tablename in ('personal_categories','personal_net_worth_snapshots')
-- group by tablename order by tablename;   -- 4 por tabela
-- ============================================================================
-- ROLLBACK:
-- begin;
--   drop table if exists public.personal_net_worth_snapshots;
--   drop table if exists public.personal_categories;
-- commit;
-- ============================================================================
