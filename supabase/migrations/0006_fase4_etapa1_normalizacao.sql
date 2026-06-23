-- ============================================================================
-- NORVO · Fase 4 — Etapa 1 (Normalização de roles)
--
-- Normaliza public.user_empresa_access.role para o vocabulário OFICIAL
-- (admin/gerente/contador/operacional) e BLINDA a coluna:
--   - normaliza roles legados (viewer/visualizador/null) → contador  (decisão D3)
--   - remove o DEFAULT perigoso ('viewer')
--   - aplica NOT NULL
--   - aplica CHECK aceitando somente os 4 perfis oficiais
--
-- NÃO toca em RLS, has_perm, financeiro, Dashboard, App.js ou supabase.js.
-- Transacional. Idempotente (safe re-run). Rodar no Supabase → SQL Editor
-- APÓS o backup validado (norvo_public_2026-06-23_115401.sql).
--
-- COMO RODAR (em 2 partes, por causa do SQL Editor que só mostra o último resultado):
--   PARTE A → rode o BLOCO 0 sozinho. Deve retornar EXATAMENTE 1 linha (o legado).
--   PARTE B → só depois de confirmar, rode o BLOCO 1+2 (begin..commit) e o BLOCO 3.
-- ============================================================================

-- ── BLOCO 0 · CONFERÊNCIA PRÉVIA (rodar SOZINHO; esperado: 1 linha) ──────────
select collaborator_user_id, empresa_id, role
from public.user_empresa_access
where role is null or role not in ('admin','gerente','contador','operacional');

-- ── BLOCO 1+2 · NORMALIZAÇÃO + BLINDAGEM (rodar após confirmar o BLOCO 0) ─────
begin;

-- 1) roles legados (viewer/visualizador/null) → contador
update public.user_empresa_access
set role = 'contador'
where role is null or role not in ('admin','gerente','contador','operacional');

-- 2) blindagem da coluna role
alter table public.user_empresa_access alter column role drop default;
alter table public.user_empresa_access alter column role set not null;
alter table public.user_empresa_access drop constraint if exists user_empresa_access_role_chk;
alter table public.user_empresa_access
  add constraint user_empresa_access_role_chk
  check (role in ('admin','gerente','contador','operacional'));

commit;

-- ── BLOCO 3 · VERIFICAÇÃO (esperado: legados_restantes=0; só os 4 perfis) ─────
select 'legados_restantes' as item, count(*)::text as valor
from public.user_empresa_access
where role is null or role not in ('admin','gerente','contador','operacional')
union all
select 'role: ' || role, count(*)::text
from public.user_empresa_access
group by role
order by item;

-- ============================================================================
-- ROLLBACK (se necessário):
-- begin;
--   alter table public.user_empresa_access drop constraint if exists user_empresa_access_role_chk;
--   alter table public.user_empresa_access alter column role drop not null;
--   alter table public.user_empresa_access alter column role set default 'viewer';
--   -- reverter o vínculo normalizado (use o collaborator_user_id capturado no BLOCO 0):
--   -- update public.user_empresa_access set role = 'viewer'
--   --   where collaborator_user_id = '<COLLAB_ID_DO_BLOCO_0>' and empresa_id = 'kz';
-- commit;
-- ============================================================================
