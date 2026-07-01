-- ============================================================================
-- NORVO · Fase 5 — B3 (correção) — aplica o lancamentos_select que faltou
--
-- Diagnóstico: a verificação pós-B4 mostrou que lancamentos_select ainda estava
-- no modelo 0003 — "(can_access_empresa OR user_id = auth.uid())", sem has_perm
-- por ação. Ou seja, o 0007 (B3) nunca foi aplicado no banco (por isso o helper
-- modulo_do_lancamento não existia até o 0008). As políticas de ESCRITA já foram
-- corrigidas pelo 0008 (B4) e NÃO devem ser tocadas aqui (têm a trava de mês).
--
-- Esta migração corrige APENAS o SELECT de lancamentos, alinhando-o ao B3:
--   SELECT → can_access_empresa AND has_perm(modulo_do_lancamento(tipo), 'visualizar')
-- Remove o escape de autor no read. Não toca em insert/update/delete.
--
-- Transacional · idempotente · NÃO altera dados.
-- Pré-requisitos: 0005 (has_perm) e 0008 (modulo_do_lancamento + políticas B4).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- Garantia de existência do helper do B3 (idempotente; mesma definição).
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

-- Corrige SOMENTE o SELECT (preserva insert/update/delete do B4 intactos).
drop policy if exists lancamentos_select on public.lancamentos;
create policy lancamentos_select on public.lancamentos for select to authenticated
  using (
    public.can_access_empresa(empresa_id)
    and public.has_perm(empresa_id, public.modulo_do_lancamento(tipo), 'visualizar')
  );

commit;

-- ============================================================================
-- VERIFICAÇÃO — flags de conteúdo por política (evita truncamento na UI):
-- ----------------------------------------------------------------------------
-- select cmd, policyname,
--   (coalesce(qual,'')       ilike '%has_perm%'          or
--    coalesce(with_check,'') ilike '%has_perm%')          as tem_has_perm,
--   (coalesce(qual,'')       ilike '%mes_esta_fechado%'   or
--    coalesce(with_check,'') ilike '%mes_esta_fechado%')  as tem_trava,
--   (coalesce(qual,'')       ilike '%user_id%'            or
--    coalesce(with_check,'') ilike '%user_id%')           as tem_escape_antigo
-- from pg_policies
-- where schemaname='public' and tablename='lancamentos'
-- order by cmd;
--
-- Esperado:
--   SELECT → tem_has_perm=t, tem_trava=f, tem_escape_antigo=f
--   INSERT → tem_has_perm=t, tem_trava=t, tem_escape_antigo=f
--   UPDATE → tem_has_perm=t, tem_trava=t, tem_escape_antigo=f
--   DELETE → tem_has_perm=t, tem_trava=t, tem_escape_antigo=f
-- ============================================================================
-- ROLLBACK (volta ao SELECT do 0003):
-- begin;
--   drop policy if exists lancamentos_select on public.lancamentos;
--   create policy lancamentos_select on public.lancamentos for select to authenticated
--     using (public.can_access_empresa(empresa_id) or user_id = auth.uid());
-- commit;
-- ============================================================================
