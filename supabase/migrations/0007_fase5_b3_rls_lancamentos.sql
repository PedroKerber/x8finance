-- ============================================================================
-- NORVO · Fase 5 — B3 — RLS por ação na tabela lancamentos (ramificada por tipo)
-- Migra o controle de escrita/leitura de can_access_empresa (só empresa) para
-- can_access_empresa + has_perm por AÇÃO, com o módulo derivado do tipo da linha.
--   receita  → receitas          despesa  → despesas          retirada → retirada_socios
-- Remove o escape "user_id = auth.uid()" (acesso passa a ser 100% empresa+perfil).
-- Tipo desconhecido/nulo ⇒ nega por padrão (só master passa via has_perm).
-- NÃO altera colunas, NÃO apaga dados. Transacional e idempotente (safe re-run).
-- Pré-requisitos: 0003 (RLS financeira) e 0005 (has_perm / role_permissions).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 1) Helper: mapeia o tipo do lançamento → módulo de permissão ─────────────
--    Espelha moduloDoTipo() do front (src/pages/Transacoes.js).
--    IMMUTABLE: função pura, sem I/O. NULL ⇒ has_perm(null) ⇒ nega (exceto master).
create or replace function public.modulo_do_lancamento(p_tipo text)
returns text language sql immutable set search_path = public as $$
  select case p_tipo
    when 'receita'  then 'receitas'
    when 'despesa'  then 'despesas'
    when 'retirada' then 'retirada_socios'
    else null
  end;
$$;
grant execute on function public.modulo_do_lancamento(text) to authenticated;

-- ── 2) Garante RLS ativa ─────────────────────────────────────────────────────
alter table public.lancamentos enable row level security;

-- ── 3) Remove TODAS as políticas atuais de lancamentos (idempotente) ─────────
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'lancamentos' loop
    execute format('drop policy if exists %I on public.lancamentos', pol.policyname);
  end loop;
end $$;

-- ── 4) Políticas por AÇÃO: empresa + permissão do perfil (ramificada por tipo)
--    Sem escape de autor: acesso = can_access_empresa AND has_perm(modulo, acao).

create policy lancamentos_select on public.lancamentos for select to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'visualizar')
  );

create policy lancamentos_insert on public.lancamentos for insert to authenticated
  with check (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'criar')
  );

create policy lancamentos_update on public.lancamentos for update to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar')
  )
  with check (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar')
  );

create policy lancamentos_delete on public.lancamentos for delete to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'excluir')
  );

-- ── 5) Grants (idempotente; enforcement real fica nas políticas acima) ───────
grant select, insert, update, delete on public.lancamentos to authenticated;

commit;

-- ============================================================================
-- Verificação (esperado: 4 políticas, sem "user_id = auth.uid()")
-- ----------------------------------------------------------------------------
-- select cmd, policyname, qual, with_check from pg_policies
-- where schemaname = 'public' and tablename = 'lancamentos' order by cmd;
--
-- select public.modulo_do_lancamento('receita')  as receita,   -- receitas
--        public.modulo_do_lancamento('despesa')  as despesa,   -- despesas
--        public.modulo_do_lancamento('retirada') as retirada,  -- retirada_socios
--        public.modulo_do_lancamento('xpto')     as desconhec, -- null (nega)
--        public.modulo_do_lancamento(null)        as nulo;      -- null (nega)
-- ============================================================================
-- ROLLBACK (restaura o modelo 0003: empresa + escape de autor):
-- begin;
--   do $$ declare pol record; begin
--     for pol in select policyname from pg_policies
--                where schemaname='public' and tablename='lancamentos' loop
--       execute format('drop policy if exists %I on public.lancamentos', pol.policyname);
--     end loop;
--   end $$;
--   create policy lancamentos_select on public.lancamentos for select to authenticated
--     using (public.can_access_empresa(empresa_id) or user_id = auth.uid());
--   create policy lancamentos_insert on public.lancamentos for insert to authenticated
--     with check (public.can_access_empresa(empresa_id));
--   create policy lancamentos_update on public.lancamentos for update to authenticated
--     using (public.can_access_empresa(empresa_id) or user_id = auth.uid())
--     with check (public.can_access_empresa(empresa_id));
--   create policy lancamentos_delete on public.lancamentos for delete to authenticated
--     using (public.can_access_empresa(empresa_id) or user_id = auth.uid());
--   -- opcional: drop function if exists public.modulo_do_lancamento(text);
-- commit;
-- ============================================================================
