import { uid } from './theme'

export const EMPRESAS = [
  { id: 'kz', nome: 'Kazole Imobiliária', initials: 'KI', cnpj: '35.586.526/0001-30', cor: '#16a34a', setor: 'Imobiliário' },
  { id: 'kzl', nome: 'KZL Construtora', initials: 'KC', cnpj: '54.823.138/0001-80', cor: '#2563eb', setor: 'Construção' },
  { id: 'ki1', nome: 'Incorporação Kazole 01', initials: 'I1', cnpj: '47.458.920/0001-10', cor: '#7c3aed', setor: 'Incorporação' },
  { id: 'ki2', nome: 'Incorporação Kazole 02', initials: 'I2', cnpj: '41.728.066/0001-90', cor: '#ea580c', setor: 'Incorporação' },
  { id: 'ace', nome: 'ACE Club', initials: 'AC', cnpj: '12.345.678/0001-90', cor: '#dc2626', setor: 'Academia/Esportes' },
  { id: 'ax', nome: 'AxionZ Tech', initials: 'AT', cnpj: '98.765.432/0001-10', cor: '#0891b2', setor: 'Tecnologia' },
  { id: 'k2', nome: 'K2 Imob', initials: 'K2', cnpj: '41.728.066/0001-85', cor: '#ca8a04', setor: 'Imobiliário' },
]

export const CATS_RECEITA = [
  { id: 'venda_imoveis', nome: 'Venda de Imóveis', cor: '#16a34a' },
  { id: 'locacao', nome: 'Locação', cor: '#2563eb' },
  { id: 'alugueis', nome: 'Aluguéis', cor: '#2563eb' },
  { id: 'comissoes', nome: 'Comissões', cor: '#7c3aed' },
  { id: 'consultoria', nome: 'Consultoria', cor: '#ea580c' },
  { id: 'prestacao_servicos', nome: 'Prestação de Serviços', cor: '#0891b2' },
  { id: 'outras_receitas', nome: 'Outras Receitas', cor: '#9ca3af' },
]

export const CATS_DESPESA = [
  { id: 'marketing', nome: 'Marketing', cor: '#2563eb' },
  { id: 'comercial', nome: 'Comercial', cor: '#dc2626' },
  { id: 'administrativo', nome: 'Administrativo', cor: '#7c3aed' },
  { id: 'trafego_pago', nome: 'Tráfego Pago', cor: '#16a34a' },
  { id: 'operacional', nome: 'Operacional', cor: '#ea580c' },
  { id: 'tecnologia', nome: 'Tecnologia', cor: '#0891b2' },
  { id: 'folha_pagamento', nome: 'Folha de Pagamento', cor: '#ca8a04' },
  { id: 'aluguel_escritorio', nome: 'Aluguel Escritório', cor: '#9ca3af' },
  { id: 'impostos', nome: 'Impostos', cor: '#6b7280' },
]

export const CONTAS = [
  { id: 'itau_cc', nome: 'Conta Corrente Itaú', tipo: 'Conta Corrente', banco: 'Itaú', saldo: 320000 },
  { id: 'bb_cc', nome: 'Conta Corrente BB', tipo: 'Conta Corrente', banco: 'Banco do Brasil', saldo: 87650 },
  { id: 'bradesco_cc', nome: 'Conta Corrente Bradesco', tipo: 'Conta Corrente', banco: 'Bradesco', saldo: 45000 },
]

const makeReceita = (empId, overrides) => ({
  id: uid(), tipo: 'receita',
  cat: 'venda_imoveis', catNome: 'Venda de Imóveis',
  desc: 'Receita', valor: 10000, data: '2026-05-15',
  vencimento: '2026-05-15', status: 'Recebida',
  forma: 'conta', conta: 'Conta Corrente Itaú',
  cliente: '', centroCusto: 'Comercial',
  empId, obs: '',
  ...overrides,
})

const makeDespesa = (empId, overrides) => ({
  id: uid(), tipo: 'despesa',
  cat: 'marketing', catNome: 'Marketing',
  desc: 'Despesa', valor: 5000, data: '2026-05-10',
  vencimento: '2026-05-10', status: 'Pago',
  forma: 'conta', conta: 'Conta Corrente Itaú',
  fornecedor: '', centroCusto: 'Marketing',
  empId, obs: '',
  ...overrides,
})

const KZ_RECEITAS = [
  makeReceita('kz', { desc: 'Venda Apartamento 101', valor: 750000, data: '2026-05-29', vencimento: '2026-05-29', status: 'Recebida', cliente: 'João Silva', cat: 'venda_imoveis', catNome: 'Venda de Imóveis' }),
  makeReceita('kz', { desc: 'Aluguel Sala Comercial 05', valor: 8500, data: '2026-05-28', vencimento: '2026-05-28', status: 'Recebida', cliente: 'ABC Ltda', cat: 'alugueis', catNome: 'Aluguéis', conta: 'Conta Corrente BB' }),
  makeReceita('kz', { desc: 'Prestação de Serviços', valor: 22000, data: '2026-05-27', vencimento: '2026-05-27', status: 'Recebida', cliente: 'XPTO Engenharia', cat: 'prestacao_servicos', catNome: 'Prestação de Serviços' }),
  makeReceita('kz', { desc: 'Comissão Corretagem', valor: 15000, data: '2026-05-25', vencimento: '2026-05-25', status: 'Recebida', cliente: 'Marcos Ferreira', cat: 'comissoes', catNome: 'Comissões' }),
  makeReceita('kz', { desc: 'Venda Terreno QI 12', valor: 240000, data: '2026-05-20', vencimento: '2026-06-20', status: 'A receber', cliente: 'Ana Paula Souza', cat: 'venda_imoveis', catNome: 'Venda de Imóveis', conta: 'Conta Corrente Bradesco' }),
  makeReceita('kz', { desc: 'Aluguel Apartamento 201', valor: 3500, data: '2026-05-18', vencimento: '2026-06-18', status: 'A receber', cliente: 'Carlos Mendes', cat: 'alugueis', catNome: 'Aluguéis', conta: 'Conta Corrente BB' }),
  makeReceita('kz', { desc: 'Venda Apartamento 303', valor: 45000, data: '2026-05-15', vencimento: '2026-05-15', status: 'Atrasada', cliente: 'Fernanda Lima', cat: 'venda_imoveis', catNome: 'Venda de Imóveis' }),
  makeReceita('kz', { desc: 'Consultoria Financeira', valor: 9950, data: '2026-05-10', vencimento: '2026-05-10', status: 'Recebida', cliente: 'Invest Group', cat: 'consultoria', catNome: 'Consultoria' }),
  makeReceita('kz', { desc: 'Comissão Jardim Botânico', valor: 18250, data: '2026-05-08', vencimento: '2026-05-08', status: 'Recebida', cliente: 'Roberto Costa', cat: 'comissoes', catNome: 'Comissões' }),
  makeReceita('kz', { desc: 'Locação Comercial CLS 214', valor: 12500, data: '2026-05-05', vencimento: '2026-05-05', status: 'Recebida', cliente: 'Tech Solutions', cat: 'locacao', catNome: 'Locação' }),
]

const KZ_DESPESAS = [
  makeDespesa('kz', { desc: 'Tráfego Pago Meta/Google', valor: 14670, data: '2026-05-20', vencimento: '2026-05-20', status: 'Pago', fornecedor: 'Meta Ads', cat: 'trafego_pago', catNome: 'Tráfego Pago', centroCusto: 'Marketing' }),
  makeDespesa('kz', { desc: 'Folha de Pagamento', valor: 13000, data: '2026-05-18', vencimento: '2026-05-18', status: 'Pago', fornecedor: 'Equipe Interna', cat: 'folha_pagamento', catNome: 'Folha de Pagamento', centroCusto: 'Administrativo' }),
  makeDespesa('kz', { desc: 'Aluguel Escritório', valor: 9800, data: '2026-05-15', vencimento: '2026-05-15', status: 'Pago', fornecedor: 'Edifício Corporativo', cat: 'aluguel_escritorio', catNome: 'Aluguel Escritório', centroCusto: 'Administrativo' }),
  makeDespesa('kz', { desc: 'Marketing e Onboarding', valor: 7714, data: '2026-05-10', vencimento: '2026-05-10', status: 'Pago', fornecedor: 'Agência Digital', cat: 'marketing', catNome: 'Marketing', centroCusto: 'Marketing' }),
  makeDespesa('kz', { desc: 'Sistemas e Softwares', valor: 6846, data: '2026-05-05', vencimento: '2026-05-05', status: 'Pago', fornecedor: 'SaaS Tools', cat: 'tecnologia', catNome: 'Tecnologia', centroCusto: 'Tecnologia' }),
  makeDespesa('kz', { desc: 'Comissão Corretor', valor: 12500, data: '2026-05-22', vencimento: '2026-05-22', status: 'Pago', fornecedor: 'Corretor Independente', cat: 'comercial', catNome: 'Comercial', centroCusto: 'Comercial' }),
  makeDespesa('kz', { desc: 'Impostos e Taxas', valor: 18200, data: '2026-05-30', vencimento: '2026-06-15', status: 'Pendente', fornecedor: 'Receita Federal', cat: 'impostos', catNome: 'Impostos', centroCusto: 'Administrativo' }),
  makeDespesa('kz', { desc: 'Material de Escritório', valor: 1200, data: '2026-05-12', vencimento: '2026-05-12', status: 'Pago', fornecedor: 'Papelaria Central', cat: 'administrativo', catNome: 'Administrativo', centroCusto: 'Administrativo' }),
]

const genLancsEmp = (empId, recMult, despMult) => {
  const receitas = [
    makeReceita(empId, { desc: 'Receita Principal', valor: Math.round(50000 * recMult), status: 'Recebida', data: '2026-05-25', vencimento: '2026-05-25', cliente: 'Cliente A' }),
    makeReceita(empId, { desc: 'Serviços Prestados', valor: Math.round(25000 * recMult), status: 'Recebida', data: '2026-05-20', vencimento: '2026-05-20', cliente: 'Cliente B' }),
    makeReceita(empId, { desc: 'Contrato Mensal', valor: Math.round(15000 * recMult), status: 'A receber', data: '2026-05-15', vencimento: '2026-06-15', cliente: 'Cliente C' }),
    makeReceita(empId, { desc: 'Projeto Especial', valor: Math.round(30000 * recMult), status: 'Recebida', data: '2026-05-10', vencimento: '2026-05-10', cliente: 'Cliente D' }),
  ]
  const despesas = [
    makeDespesa(empId, { desc: 'Folha de Pagamento', valor: Math.round(20000 * despMult), status: 'Pago', data: '2026-05-20', vencimento: '2026-05-20', cat: 'folha_pagamento', catNome: 'Folha de Pagamento' }),
    makeDespesa(empId, { desc: 'Marketing Digital', valor: Math.round(8000 * despMult), status: 'Pago', data: '2026-05-15', vencimento: '2026-05-15', cat: 'marketing', catNome: 'Marketing' }),
    makeDespesa(empId, { desc: 'Operacional', valor: Math.round(5000 * despMult), status: 'Pago', data: '2026-05-10', vencimento: '2026-05-10', cat: 'operacional', catNome: 'Operacional' }),
    makeDespesa(empId, { desc: 'Impostos', valor: Math.round(12000 * despMult), status: 'Pendente', data: '2026-05-30', vencimento: '2026-06-15', cat: 'impostos', catNome: 'Impostos' }),
  ]
  return [...receitas, ...despesas]
}

export const METAS_SEED = [
  { id: 'm1', nome: 'Meta de Receita', objetivo: 1200000, acumulado: 984000, tipo: 'receita', prazo: '2026-12-31' },
  { id: 'm2', nome: 'Meta de Lucro Líquido', objetivo: 500000, acumulado: 390000, tipo: 'lucro', prazo: '2026-12-31' },
  { id: 'm3', nome: 'Meta de Margem Líquida', objetivo: 45, acumulado: 39.8, tipo: 'margem', prazo: '2026-12-31' },
]

export const initData = () => {
  const d = {}
  EMPRESAS.forEach(emp => {
    const mults = { kz: [10, 1], kzl: [8, 1.5], ki1: [5, 0.8], ki2: [4, 0.7], ace: [3, 0.9], ax: [6, 1.1], k2: [7, 1.2] }
    const [r, d2] = mults[emp.id] || [5, 1]
    d[emp.id] = {
      lancamentos: emp.id === 'kz' ? [...KZ_RECEITAS, ...KZ_DESPESAS] : genLancsEmp(emp.id, r, d2),
      metas: METAS_SEED.map(m => ({ ...m })),
      mesFechado: emp.id === 'kz',
    }
  })
  return d
}

export const genFluxoCaixaData = (lancamentos) => {
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    const date = `2026-05-${String(day).padStart(2, '0')}`
    const entradas = lancamentos
      .filter(l => l.tipo === 'receita' && l.data === date && l.status === 'Recebida')
      .reduce((s, l) => s + l.valor, 0)
    const saidas = lancamentos
      .filter(l => l.tipo === 'despesa' && l.data === date && l.status === 'Pago')
      .reduce((s, l) => s + l.valor, 0)
    return { dia: `${day < 10 ? '0' : ''}${day}/05`, entradas, saidas }
  })
  let acumulado = 320000
  return days.map(d => {
    acumulado += d.entradas - d.saidas
    return { ...d, saldo: acumulado }
  })
}
