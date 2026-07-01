-- ============================================================================
-- NORVO · Fase 5 — B4 — RLS por ação em mes_fechado + trava de mês (lancamentos)
--
-- Duas entregas, ambas SÓ de políticas/funções (NÃO altera dados):
--   1) mes_fechado passa de 1 policy "for all" (só empresa) para RLS por AÇÃO:
--        SELECT   → has_perm(mes_fechado, visualizar)
--        INSERT   → has_perm(mes_fechado, criar)          (fechar mês)
--        UPDATE   → has_perm(mes_fechado, criar) + guarda: reabrir (fechado=false)
--                   SOMENTE master (decisão D6)
--        DELETE   → has_perm(mes_fechado, excluir)
--   2) TRAVA DE MÊS: escrita em lancamentos (insert/update/delete) é bloqueada
--      quando a competência (left(data,7)) está fechada para a empresa.
--      Master é o escape (coerente com "reabrir = só master" e o padrão master⇒true).
--      Leitura de lancamentos (B3 lancamentos_select) NÃO é afetada.
--
-- Transacional · idempotente (safe re-run). Preserva as políticas do B3 (0007):
-- só recria as 3 de ESCRITA de lancamentos, acrescentando a trava; o SELECT do B3
-- permanece intacto.
-- Pré-requisitos: 0001 (mes_fechado), 0005 (has_perm/is_master), 0007 (B3).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 0) Helper do B3 (garantia de existência) ─────────────────────────────────
--    As políticas de escrita de lancamentos abaixo dependem de
--    public.modulo_do_lancamento(text). Recriado aqui (idempotente, mesma
--    definição do 0007) para a B4 não depender da ordem/estado do B3.
--    Mapa: receita→receitas, despesa→despesas, retirada→retirada_socios,
--    desconhecido/nulo→null (has_perm(null) ⇒ nega, exceto master).
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

-- ── 1) Helper: a competência do lançamento está fechada nessa empresa? ───────
--    SECURITY DEFINER: lê mes_fechado ignorando RLS (a trava vale mesmo p/ quem
--    não tem 'visualizar' em mes_fechado). data::text cobre coluna date OU text
--    (ISO 'YYYY-MM-DD' ⇒ left(...,7) = 'YYYY-MM'). data nula ⇒ não fechado.
create or replace function public.mes_esta_fechado(p_empresa_id text, p_data text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.mes_fechado mf
    where mf.empresa_id = p_empresa_id
      and mf.competencia = left(p_data, 7)
      and mf.fechado
  );
$$;
grant execute on function public.mes_esta_fechado(text, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 2) mes_fechado — RLS por ação
-- ════════════════════════════════════════════════════════════════════════════
alter table public.mes_fechado enable row level security;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'mes_fechado' loop
    execute format('drop policy if exists %I on public.mes_fechado', pol.policyname);
  end loop;
end $$;

create policy mes_fechado_select on public.mes_fechado for select to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, 'mes_fechado', 'visualizar')
  );

create policy mes_fechado_insert on public.mes_fechado for insert to authenticated
  with check (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, 'mes_fechado', 'criar')
  );

create policy mes_fechado_update on public.mes_fechado for update to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, 'mes_fechado', 'criar')
  )
  with check (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, 'mes_fechado', 'criar')
    and (fechado or public.is_master())   -- reabrir (fechado=false) ⇒ só master (D6)
  );

create policy mes_fechado_delete on public.mes_fechado for delete to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, 'mes_fechado', 'excluir')
  );

grant select, insert, update, delete on public.mes_fechado to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 3) lancamentos — TRAVA DE MÊS nas 3 políticas de escrita (preserva o B3)
--    Recria só insert/update/delete = (lógica B3) AND (não fechado OR master).
--    lancamentos_select do B3 permanece inalterado.
-- ════════════════════════════════════════════════════════════════════════════
drop policy if exists lancamentos_insert on public.lancamentos;
drop policy if exists lancamentos_update on public.lancamentos;
drop policy if exists lancamentos_delete on public.lancamentos;

create policy lancamentos_insert on public.lancamentos for insert to authenticated
  with check (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'criar')
    and (public.is_master() or not public.mes_esta_fechado(empresa_id, data::text))
  );

create policy lancamentos_update on public.lancamentos for update to authenticated
  using (      -- linha ANTIGA: não pode editar se o mês de origem está fechado
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar')
    and (public.is_master() or not public.mes_esta_fechado(empresa_id, data::text))
  )
  with check ( -- linha NOVA: não pode mover/gravar para um mês fechado
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar')
    and (public.is_master() or not public.mes_esta_fechado(empresa_id, data::text))
  );

create policy lancamentos_delete on public.lancamentos for delete to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'excluir')
    and (public.is_master() or not public.mes_esta_fechado(empresa_id, data::text))
  );

commit;

-- ============================================================================
-- VERIFICAÇÃO (rodar após aplicar)
-- ----------------------------------------------------------------------------
-- -- (a) mes_fechado: 4 políticas por ação; update deve ter "(fechado OR is_master())"
-- select cmd, policyname, qual, with_check from pg_policies
-- where schemaname='public' and tablename='mes_fechado' order by cmd;
--
-- -- (b) lancamentos: 4 políticas; as 3 de escrita com "mes_esta_fechado"; select intacto
-- select cmd, policyname, qual, with_check from pg_policies
-- where schemaname='public' and tablename='lancamentos' order by cmd;
--
-- -- (c) helper responde certo (informativo; confirma tipo de lancamentos.data)
-- select data_type from information_schema.columns
-- where table_schema='public' and table_name='lancamentos' and column_name='data';
-- ============================================================================
-- ROLLBACK (restaura 0001 em mes_fechado e as políticas B3/0007 em lancamentos):
-- begin;
--   do $$ declare pol record; begin
--     for pol in select policyname from pg_policies
--                where schemaname='public' and tablename='mes_fechado' loop
--       execute format('drop policy if exists %I on public.mes_fechado', pol.policyname);
--     end loop;
--   end $$;
--   create policy mes_fechado_access on public.mes_fechado for all to authenticated
--     using (public.can_access_empresa(empresa_id))
--     with check (public.can_access_empresa(empresa_id));
--
--   drop policy if exists lancamentos_insert on public.lancamentos;
--   drop policy if exists lancamentos_update on public.lancamentos;
--   drop policy if exists lancamentos_delete on public.lancamentos;
--   create policy lancamentos_insert on public.lancamentos for insert to authenticated
--     with check (public.can_access_empresa(empresa_id)
--       and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'criar'));
--   create policy lancamentos_update on public.lancamentos for update to authenticated
--     using (public.can_access_empresa(empresa_id)
--       and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar'))
--     with check (public.can_access_empresa(empresa_id)
--       and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'editar'));
--   create policy lancamentos_delete on public.lancamentos for delete to authenticated
--     using (public.can_access_empresa(empresa_id)
--       and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'excluir'));
--   -- opcional: drop function if exists public.mes_esta_fechado(text, text);
-- commit;
-- ============================================================================
