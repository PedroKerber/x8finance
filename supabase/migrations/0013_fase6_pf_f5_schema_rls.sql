-- ============================================================================
-- NORVO · Fase 6 — Plano Pessoa Física (PF) — F5: funcionalidades finais
--
-- Recorrências, parcelamento, fatura de cartão, transferências entre contas,
-- orçamento mensal e fechamento mensal pessoal.
-- 100% ADITIVA. Isolamento total por usuário via RLS (user_id = auth.uid()).
--
-- Transacional · idempotente. Pré-req: 0001 (set_updated_at), 0010/0011 (PF).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 0) Colunas em personal_transactions (recorrência + parcelamento) ─────────
alter table public.personal_transactions add column if not exists recurrence_id text;
alter table public.personal_transactions add column if not exists installment_id text;

-- ── 1) personal_recurrences — modelos de lançamento recorrente ───────────────
create table if not exists public.personal_recurrences (
  id             text primary key default gen_random_uuid()::text,
  user_id        uuid not null references auth.users(id) on delete cascade,
  tipo           text not null,               -- receita|despesa
  valor          numeric not null default 0,
  categoria      text,
  descricao      text,
  account_id     text,
  credit_card_id text,
  frequency      text not null default 'mensal', -- mensal|semanal|anual
  start_date     date not null,
  end_date       date,
  status         text not null default 'ativo',  -- ativo|inativo
  last_generated date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── 2) personal_transfers — transferências entre contas (movimentação interna)
create table if not exists public.personal_transfers (
  id              text primary key default gen_random_uuid()::text,
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_account_id text,
  to_account_id   text,
  valor           numeric not null default 0,
  data            date,
  obs             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── 3) personal_budgets — orçamento mensal por categoria ─────────────────────
create table if not exists public.personal_budgets (
  id         text primary key default gen_random_uuid()::text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  categoria  text not null,
  amount     numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, categoria)
);

-- ── 4) personal_card_invoices — status/pagamento da fatura por competência ───
create table if not exists public.personal_card_invoices (
  id          text primary key default gen_random_uuid()::text,
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     text not null,
  competencia text not null,                  -- 'YYYY-MM'
  amount      numeric not null default 0,
  status      text not null default 'aberta', -- aberta|fechada|paga
  account_id  text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, card_id, competencia)
);

-- ── 5) personal_monthly_closings — fechamento mensal pessoal ─────────────────
create table if not exists public.personal_monthly_closings (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references auth.users(id) on delete cascade,
  month             int not null,
  year              int not null,
  total_income      numeric not null default 0,
  total_expenses    numeric not null default 0,
  balance           numeric not null default 0,
  accounts_total    numeric not null default 0,
  investments_total numeric not null default 0,
  debts_total       numeric not null default 0,
  net_worth         numeric not null default 0,
  notes             text,
  closed_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, year, month)
);

create index if not exists idx_personal_recurrences_user on public.personal_recurrences(user_id);
create index if not exists idx_personal_transfers_user   on public.personal_transfers(user_id);
create index if not exists idx_personal_budgets_user     on public.personal_budgets(user_id);
create index if not exists idx_personal_cardinv_user     on public.personal_card_invoices(user_id, card_id, competencia);
create index if not exists idx_personal_closings_user    on public.personal_monthly_closings(user_id, year, month);

-- ── 6) Triggers updated_at ───────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['personal_recurrences','personal_transfers','personal_budgets','personal_card_invoices','personal_monthly_closings'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ── 7) RLS — isolamento total por usuário ────────────────────────────────────
do $$
declare t text; pol record;
begin
  foreach t in array array['personal_recurrences','personal_transfers','personal_budgets','personal_card_invoices','personal_monthly_closings'] loop
    execute format('alter table public.%I enable row level security', t);
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
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

commit;

-- ============================================================================
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- select tablename, count(*) as policies from pg_policies
-- where schemaname='public'
--   and tablename in ('personal_recurrences','personal_transfers','personal_budgets','personal_card_invoices','personal_monthly_closings')
-- group by tablename order by tablename;   -- 4 por tabela (5 tabelas)
-- ============================================================================
-- ROLLBACK:
-- begin;
--   drop table if exists public.personal_monthly_closings;
--   drop table if exists public.personal_card_invoices;
--   drop table if exists public.personal_budgets;
--   drop table if exists public.personal_transfers;
--   drop table if exists public.personal_recurrences;
--   alter table public.personal_transactions drop column if exists installment_id;
--   alter table public.personal_transactions drop column if exists recurrence_id;
-- commit;
-- ============================================================================
