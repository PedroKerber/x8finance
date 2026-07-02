-- ============================================================================
-- NORVO · Fase 6 — PF — Família / Compartilhamento (FASE 2.2 — SLICE 1)
--
-- Compartilhamento REAL dos dados, começando pelas 2 tabelas-base:
--   personal_accounts  (contas / "saldo em contas")
--   personal_transactions (lançamentos: receitas + despesas)
--
-- Adiciona space_id (MANTENDO user_id), migra dados existentes para o espaço
-- individual do dono, e libera a RLS por MEMBERSHIP do espaço (sem deixar de
-- funcionar por user_id). NÃO mexe nas outras tabelas financeiras (vêm depois).
--
-- Segurança: membro só vê/edita um espaço se pertencer a ele; leitura = qualquer
-- membro aceito; escrita = dono/admin/editor (viewer é só leitura). Permissões
-- finas por campo/ação ficam para a Fase 3.
--
-- Transacional · idempotente. Pré-req: 0010 (accounts/tx), 0015 (spaces/members).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 1) Coluna space_id (aditiva, mantém user_id) ─────────────────────────────
alter table public.personal_accounts     add column if not exists space_id text references public.personal_spaces(id) on delete set null;
alter table public.personal_transactions add column if not exists space_id text references public.personal_spaces(id) on delete set null;

create index if not exists idx_personal_accounts_space on public.personal_accounts(space_id);
create index if not exists idx_personal_tx_space       on public.personal_transactions(space_id);

-- ── 2) Backfill: vincula cada linha ao espaço individual do próprio dono ─────
update public.personal_accounts a
   set space_id = s.id
  from public.personal_spaces s
 where s.owner_user_id = a.user_id and a.space_id is null;

update public.personal_transactions t
   set space_id = s.id
  from public.personal_spaces s
 where s.owner_user_id = t.user_id and t.space_id is null;

-- ── 3) Rede de segurança: preenche space_id no insert quando vier nulo ───────
-- (garante que nenhuma linha fique sem espaço, mesmo vindo de app antigo ou de
--  geração de recorrência). Se o app informar space_id (ex.: membro lançando no
--  espaço compartilhado), o trigger respeita.
create or replace function public.pf_fill_space_id()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.space_id is null then
    select id into new.space_id from public.personal_spaces where owner_user_id = new.user_id limit 1;
  end if;
  return new;
end $$;

drop trigger if exists trg_personal_accounts_space on public.personal_accounts;
create trigger trg_personal_accounts_space before insert on public.personal_accounts
  for each row execute function public.pf_fill_space_id();
drop trigger if exists trg_personal_tx_space on public.personal_transactions;
create trigger trg_personal_tx_space before insert on public.personal_transactions
  for each row execute function public.pf_fill_space_id();

-- ── 4) Helper: pode editar o espaço? (dono / admin / editor — viewer não) ────
create or replace function public.pf_can_edit_space(sid text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.personal_spaces s
                 where s.id = sid and s.owner_user_id = auth.uid())
      or exists (select 1 from public.personal_space_members m
                 where m.space_id = sid and m.user_id = auth.uid()
                   and m.status = 'accepted' and m.role in ('admin','editor'));
$$;
revoke all on function public.pf_can_edit_space(text) from public;
grant execute on function public.pf_can_edit_space(text) to authenticated;

-- ── 5) RLS por membership (mantém acesso por user_id) ────────────────────────
-- SELECT: dono do dado OU membro aceito do espaço do dado.
-- INSERT/UPDATE/DELETE: dono do dado OU editor/admin/dono do espaço do dado.
do $$
declare t text; pol record;
begin
  foreach t in array array['personal_accounts','personal_transactions'] loop
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format($f$create policy %1$s_select on public.%1$s for select to authenticated
                     using (user_id = auth.uid()
                            or (space_id is not null and public.pf_is_space_member(space_id)))$f$, t);
    execute format($f$create policy %1$s_insert on public.%1$s for insert to authenticated
                     with check (user_id = auth.uid()
                            and (space_id is null or public.pf_can_edit_space(space_id)))$f$, t);
    execute format($f$create policy %1$s_update on public.%1$s for update to authenticated
                     using (user_id = auth.uid()
                            or (space_id is not null and public.pf_can_edit_space(space_id)))
                     with check (user_id = auth.uid()
                            or (space_id is not null and public.pf_can_edit_space(space_id)))$f$, t);
    execute format($f$create policy %1$s_delete on public.%1$s for delete to authenticated
                     using (user_id = auth.uid()
                            or (space_id is not null and public.pf_can_edit_space(space_id)))$f$, t);
  end loop;
end $$;

grant select, insert, update, delete on public.personal_accounts, public.personal_transactions to authenticated;

commit;

-- ============================================================================
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- -- toda linha com espaço:
-- select count(*) filter (where space_id is null) as sem_espaco_contas from public.personal_accounts;
-- select count(*) filter (where space_id is null) as sem_espaco_tx     from public.personal_transactions;   -- ambos 0
-- -- 4 políticas por tabela:
-- select tablename, count(*) from pg_policies where schemaname='public'
--   and tablename in ('personal_accounts','personal_transactions') group by tablename;
-- ============================================================================
-- ROLLBACK (volta ao isolamento por user_id):
-- begin;
--   do $$ declare t text; pol record; begin
--     foreach t in array array['personal_accounts','personal_transactions'] loop
--       for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
--         execute format('drop policy if exists %I on public.%I', pol.policyname, t); end loop;
--       execute format($f$create policy %1$s_select on public.%1$s for select to authenticated using (user_id = auth.uid())$f$, t);
--       execute format($f$create policy %1$s_insert on public.%1$s for insert to authenticated with check (user_id = auth.uid())$f$, t);
--       execute format($f$create policy %1$s_update on public.%1$s for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())$f$, t);
--       execute format($f$create policy %1$s_delete on public.%1$s for delete to authenticated using (user_id = auth.uid())$f$, t);
--     end loop; end $$;
--   drop trigger if exists trg_personal_tx_space on public.personal_transactions;
--   drop trigger if exists trg_personal_accounts_space on public.personal_accounts;
--   drop function if exists public.pf_fill_space_id();
--   drop function if exists public.pf_can_edit_space(text);
--   alter table public.personal_transactions drop column if exists space_id;
--   alter table public.personal_accounts drop column if exists space_id;
-- commit;
-- ============================================================================
