-- ============================================================================
-- NORVO · Fase 6 — PF — Família / Compartilhamento (FASE 2.1: aceite do convite)
--
-- RPCs seguras (SECURITY DEFINER) para o convidado ver/aceitar/recusar convites,
-- sem poder alterar a própria permissão nem aceitar convite de outro e-mail.
-- NENHUMA tabela financeira é alterada. Nenhuma alteração de schema — só funções.
--
-- Transacional · idempotente. Pré-req: 0015 (spaces + members).
-- Rodar no Supabase → SQL Editor.
-- ============================================================================
begin;

-- ── 1) Convites pendentes do usuário logado (enriquecidos) ───────────────────
-- SECURITY DEFINER: o convidado ainda não é membro aceito, então não passa na RLS
-- de personal_spaces/auth.users; a função devolve só o necessário, filtrando pelo
-- e-mail do próprio usuário autenticado.
create or replace function public.pf_my_space_invites()
returns table (member_id text, space_id text, space_name text, role text, invited_by_email text, invited_at timestamptz)
language sql security definer stable set search_path = public as $$
  select m.id, m.space_id, s.name, m.role,
         (select u.email from auth.users u where u.id = m.invited_by),
         m.invited_at
  from public.personal_space_members m
  join public.personal_spaces s on s.id = m.space_id
  where m.status = 'pending'
    and lower(m.email) = lower(coalesce(auth.email(), ''));
$$;
revoke all on function public.pf_my_space_invites() from public;
grant execute on function public.pf_my_space_invites() to authenticated;

-- ── 2) Aceitar convite ───────────────────────────────────────────────────────
-- Regras: só o autenticado com o MESMO e-mail do convite; só se pending; preenche
-- user_id = auth.uid(); NÃO altera role (sem auto-promoção); idempotência básica.
create or replace function public.pf_accept_space_invite(mid text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rec public.personal_space_members%rowtype;
begin
  select * into rec from public.personal_space_members where id = mid;
  if not found then raise exception 'Convite não encontrado'; end if;
  if lower(rec.email) <> lower(coalesce(auth.email(), '')) then raise exception 'Este convite não é para você'; end if;
  if rec.status = 'removed' then raise exception 'Convite indisponível'; end if;
  if rec.status = 'accepted' then return true; end if;  -- idempotente
  update public.personal_space_members
     set user_id = auth.uid(), status = 'accepted', accepted_at = now()
   where id = mid;
  return true;
end $$;
revoke all on function public.pf_accept_space_invite(text) from public;
grant execute on function public.pf_accept_space_invite(text) to authenticated;

-- ── 3) Recusar convite ───────────────────────────────────────────────────────
-- Marca como 'removed' (some da listagem). Só o convidado do próprio e-mail.
create or replace function public.pf_decline_space_invite(mid text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rec public.personal_space_members%rowtype;
begin
  select * into rec from public.personal_space_members where id = mid;
  if not found then raise exception 'Convite não encontrado'; end if;
  if lower(rec.email) <> lower(coalesce(auth.email(), '')) then raise exception 'Este convite não é para você'; end if;
  if rec.status = 'accepted' then raise exception 'Convite já aceito'; end if;
  update public.personal_space_members set status = 'removed' where id = mid;
  return true;
end $$;
revoke all on function public.pf_decline_space_invite(text) from public;
grant execute on function public.pf_decline_space_invite(text) to authenticated;

commit;

-- ============================================================================
-- VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- select proname from pg_proc where proname in
--   ('pf_my_space_invites','pf_accept_space_invite','pf_decline_space_invite');  -- 3 linhas
-- ============================================================================
-- ROLLBACK:
-- begin;
--   drop function if exists public.pf_decline_space_invite(text);
--   drop function if exists public.pf_accept_space_invite(text);
--   drop function if exists public.pf_my_space_invites();
-- commit;
-- ============================================================================
