-- ============================================================================
-- NORVO · Fase 6 — Plano Pessoa Física (PF) — F1: schema + RLS (fundação)
--
-- Produto NOVO e INDEPENDENTE dentro do Norvo: ambiente financeiro pessoal.
-- NÃO é empresa, NÃO participa do multiempresas, NÃO vê dado empresarial.
--
-- Esta migração é 100% ADITIVA: cria tabelas personal_* + função
-- is_personal_account(). NÃO altera nenhuma tabela/policy existente (Fase 5
-- intacta). Isolamento total por usuário via RLS (user_id = auth.uid()).
--
-- Fonte da verdade do "tipo de conta": presença de linha em personal_profiles.
-- Conta PF é exclusiva (decisão de produto) — quem tem personal_profiles é PF.
--
-- Transacional · idempotente (safe re-run). Pré-requisito: 0001 (set_updated_at).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 1) personal_profiles — perfil pessoal (user_id = PK; presença ⇒ conta PF) ─
create table if not exists public.personal_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text,
  plano      text not null default 'pessoal',
  moeda      text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 2) personal_accounts — contas bancárias/carteiras da pessoa ──────────────
create table if not exists public.personal_accounts (
  id            text primary key default gen_random_uuid()::text,
  user_id       uuid not null references auth.users(id) on delete cascade,
  nome          text not null,
  banco         text,
  tipo          text,                       -- corrente|poupanca|investimento|carteira|digital
  saldo_inicial numeric not null default 0,
  saldo_atual   numeric not null default 0,
  obs           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 3) personal_transactions — receitas + despesas (ramificada por tipo) ─────
--    credit_card_id/parcela_* já previstos (cartão entra na F2, sem FK ainda).
create table if not exists public.personal_transactions (
  id              text primary key default gen_random_uuid()::text,
  user_id         uuid not null references auth.users(id) on delete cascade,
  tipo            text not null,            -- receita|despesa
  valor           numeric not null default 0,
  data            date,
  categoria       text,
  descricao       text,
  account_id      text references public.personal_accounts(id) on delete set null,
  forma_pagamento text,
  recorrencia     text,
  status          text,
  credit_card_id  text,
  anexo_url       text,
  parcela_num     int,
  parcela_total   int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_personal_accounts_user     on public.personal_accounts(user_id);
create index if not exists idx_personal_transactions_user on public.personal_transactions(user_id);
create index if not exists idx_personal_transactions_data on public.personal_transactions(user_id, data);

-- ── 4) Triggers updated_at (função set_updated_at já existe — 0001) ──────────
do $$
declare t text;
begin
  foreach t in array array['personal_profiles','personal_accounts','personal_transactions'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ── 5) Helper: a conta logada é Pessoa Física? (verdade do servidor) ─────────
create or replace function public.is_personal_account()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.personal_profiles where user_id = auth.uid());
$$;
grant execute on function public.is_personal_account() to authenticated;

-- ── 6) RLS — isolamento total por usuário (user_id = auth.uid()) ─────────────
--    Padrão único aplicado às 3 tabelas via loop (idempotente).
alter table public.personal_profiles     enable row level security;
alter table public.personal_accounts     enable row level security;
alter table public.personal_transactions enable row level security;

do $$
declare t text; pol record;
begin
  foreach t in array array['personal_profiles','personal_accounts','personal_transactions'] loop
    -- limpa políticas antigas da tabela
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    -- recria as 4 políticas por ação
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
  on public.personal_profiles, public.personal_accounts, public.personal_transactions
  to authenticated;

commit;

-- ============================================================================
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- -- 4 políticas por tabela personal_*
-- select tablename, count(*) as policies from pg_policies
-- where schemaname='public' and tablename like 'personal_%'
-- group by tablename order by tablename;
--
-- -- helper (como usuário PF ⇒ true; empresarial ⇒ false)
-- select public.is_personal_account();
-- ============================================================================
-- ROLLBACK:
-- begin;
--   drop function if exists public.is_personal_account();
--   drop table if exists public.personal_transactions;
--   drop table if exists public.personal_accounts;
--   drop table if exists public.personal_profiles;
-- commit;
-- ============================================================================
