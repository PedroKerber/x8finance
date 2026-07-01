// ── Norvo · Plano Pessoa Física — camada de dados ───────────────────────────
// Wrappers finos sobre o mesmo client do app (src/supabase.js). RLS filtra por
// user_id = auth.uid(); user_id é gravado no insert p/ satisfazer o WITH CHECK.
import { supabase } from './supabase'

// ── Contexto de conta (roteamento do shell) ─────────────────────────────────
// Retorna { type: 'pf' | 'empresarial', profile }. Fonte da verdade = presença
// de linha em personal_profiles (espelha getMyAccess do empresarial).
export const getAccountContext = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { type: 'empresarial', profile: null }
  const { data, error } = await supabase
    .from('personal_profiles')
    .select('user_id, nome, plano, moeda')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) return { type: 'empresarial', profile: null } // tabela ausente / erro ⇒ fluxo atual
  if (!data) return { type: 'empresarial', profile: null }
  return {
    type: 'pf',
    profile: { userId: data.user_id, nome: data.nome || '', plano: data.plano || 'pessoal', moeda: data.moeda || 'BRL' },
  }
}

// ── Contas bancárias ────────────────────────────────────────────────────────
const mapAccount = (r) => ({
  id: r.id, nome: r.nome, banco: r.banco || '', tipo: r.tipo || '',
  saldoInicial: Number(r.saldo_inicial) || 0, saldoAtual: Number(r.saldo_atual) || 0,
  obs: r.obs || '',
})

export const getPersonalAccounts = async () => {
  const { data, error } = await supabase
    .from('personal_accounts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(mapAccount)
}

export const savePersonalAccount = async (acc, userId) => {
  const row = {
    id: acc.id, user_id: userId, nome: acc.nome, banco: acc.banco || null,
    tipo: acc.tipo || null, saldo_inicial: acc.saldoInicial || 0,
    saldo_atual: acc.saldoAtual != null ? acc.saldoAtual : (acc.saldoInicial || 0),
    obs: acc.obs || null,
  }
  const { error } = await supabase.from('personal_accounts').upsert(row)
  if (error) throw error
}

export const deletePersonalAccount = async (id) => {
  const { error } = await supabase.from('personal_accounts').delete().eq('id', id)
  if (error) throw error
}

// ── Transações (receitas + despesas) ────────────────────────────────────────
const mapTx = (r) => ({
  id: r.id, tipo: r.tipo, valor: Number(r.valor) || 0, data: r.data,
  categoria: r.categoria || '', desc: r.descricao || '', accountId: r.account_id || '',
  forma: r.forma_pagamento || '', recorrencia: r.recorrencia || '', status: r.status || '',
  cartaoId: r.credit_card_id || '', anexoUrl: r.anexo_url || '',
  parcelaNum: r.parcela_num || null, parcelaTotal: r.parcela_total || null,
})

const toTxRow = (item, userId) => ({
  id: item.id, user_id: userId, tipo: item.tipo, valor: item.valor || 0,
  data: item.data || null, categoria: item.categoria || null, descricao: item.desc || null,
  account_id: item.accountId || null, forma_pagamento: item.forma || null,
  recorrencia: item.recorrencia || null, status: item.status || null,
  credit_card_id: item.cartaoId || null, anexo_url: item.anexoUrl || null,
  parcela_num: item.parcelaNum || null, parcela_total: item.parcelaTotal || null,
})

export const getPersonalTransactions = async () => {
  const { data, error } = await supabase
    .from('personal_transactions')
    .select('*')
    .order('data', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTx)
}

export const savePersonalTransaction = async (item, userId) => {
  const { error } = await supabase.from('personal_transactions').upsert(toTxRow(item, userId))
  if (error) throw error
}

export const savePersonalTransactions = async (items, userId) => {
  const rows = items.map(i => toTxRow(i, userId))
  const { error } = await supabase.from('personal_transactions').upsert(rows)
  if (error) throw error
}

export const deletePersonalTransaction = async (id) => {
  const { error } = await supabase.from('personal_transactions').delete().eq('id', id)
  if (error) throw error
}
