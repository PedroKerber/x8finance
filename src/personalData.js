// ── Norvo · Plano Pessoa Física — dados de referência (constantes) ──────────
// Espelha o padrão de CATS_RECEITA/CATS_DESPESA de src/data.js, porém pessoal.
// Categorias padrão fixas (F1); custom por usuário fica para fase futura.

export const CATS_RECEITA_PF = [
  { id: 'salario',      nome: 'Salário',      cor: '#16a34a', icon: '💼' },
  { id: 'comissao',     nome: 'Comissão',     cor: '#22c55e', icon: '🤝' },
  { id: 'prolabore',    nome: 'Pró-labore',   cor: '#15803d', icon: '🧾' },
  { id: 'aluguel_rec',  nome: 'Aluguel',      cor: '#0891b2', icon: '🏠' },
  { id: 'dividendos',   nome: 'Dividendos',   cor: '#2563eb', icon: '📈' },
  { id: 'investimentos_rec', nome: 'Investimentos', cor: '#7c3aed', icon: '💹' },
  { id: 'freelance',    nome: 'Freelance',    cor: '#ea580c', icon: '💻' },
  { id: 'reembolso',    nome: 'Reembolso',    cor: '#0d9488', icon: '↩️' },
  { id: 'outros_rec',   nome: 'Outros',       cor: '#9ca3af', icon: '➕' },
]

export const CATS_DESPESA_PF = [
  { id: 'moradia',       nome: 'Moradia',           cor: '#dc2626', icon: '🏡' },
  { id: 'alimentacao',   nome: 'Alimentação',       cor: '#ea580c', icon: '🍽️' },
  { id: 'transporte',    nome: 'Transporte',        cor: '#f59e0b', icon: '🚗' },
  { id: 'saude',         nome: 'Saúde',             cor: '#ef4444', icon: '🩺' },
  { id: 'educacao',      nome: 'Educação',          cor: '#2563eb', icon: '📚' },
  { id: 'lazer',         nome: 'Lazer',             cor: '#7c3aed', icon: '🎉' },
  { id: 'academia',      nome: 'Academia',          cor: '#16a34a', icon: '🏋️' },
  { id: 'assinaturas',   nome: 'Assinaturas',       cor: '#8b5cf6', icon: '📺' },
  { id: 'familia',       nome: 'Família',           cor: '#ec4899', icon: '👨‍👩‍👧' },
  { id: 'impostos',      nome: 'Impostos',          cor: '#78716c', icon: '🏛️' },
  { id: 'cartao',        nome: 'Cartão de crédito', cor: '#6366f1', icon: '💳' },
  { id: 'dividas',       nome: 'Dívidas',           cor: '#b91c1c', icon: '📉' },
  { id: 'investimentos_desp', nome: 'Investimentos', cor: '#0891b2', icon: '💰' },
  { id: 'outros_desp',   nome: 'Outros',            cor: '#9ca3af', icon: '➖' },
]

export const TIPOS_CONTA_PF = [
  { id: 'corrente',     label: 'Conta Corrente'    },
  { id: 'poupanca',     label: 'Conta Poupança'    },
  { id: 'investimento', label: 'Conta Investimento' },
  { id: 'carteira',     label: 'Carteira'          },
  { id: 'digital',      label: 'Conta Digital'     },
]

// F2 — usados por Investimentos (mantidos aqui para centralizar o vocabulário)
export const TIPOS_INVESTIMENTO_PF = [
  { id: 'cdb',     label: 'CDB'            },
  { id: 'tesouro', label: 'Tesouro Direto' },
  { id: 'fundos',  label: 'Fundos'        },
  { id: 'acoes',   label: 'Ações'         },
  { id: 'fii',     label: 'FIIs'          },
  { id: 'cripto',  label: 'Cripto'        },
  { id: 'imoveis', label: 'Imóveis'       },
  { id: 'outros',  label: 'Outros'        },
]

export const FORMAS_PAGAMENTO_PF = ['Pix', 'Dinheiro', 'Débito', 'Crédito', 'Boleto', 'Transferência']
export const RECORRENCIAS_PF     = ['Único', 'Mensal', 'Semanal', 'Anual']
export const STATUS_RECEITA_PF   = ['Recebida', 'A receber']
export const STATUS_DESPESA_PF   = ['Pago', 'A Pagar', 'Pendente', 'Atrasado']

// Helpers de lookup
export const catReceitaNome = (id) => CATS_RECEITA_PF.find(c => c.id === id)?.nome || id || '—'
export const catDespesaNome = (id) => CATS_DESPESA_PF.find(c => c.id === id)?.nome || id || '—'
export const catNomePF = (tipo, id) => (tipo === 'receita' ? catReceitaNome : catDespesaNome)(id)
export const tipoContaLabel = (id) => TIPOS_CONTA_PF.find(t => t.id === id)?.label || id || '—'
