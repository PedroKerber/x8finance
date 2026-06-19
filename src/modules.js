// ── Segmentos de empresa (vocabulário controlado) ──────────────────────────
export const SEGMENTOS = [
  { id: 'imobiliaria',   label: 'Imobiliária'       },
  { id: 'construtora',   label: 'Construtora'        },
  { id: 'incorporadora', label: 'Incorporadora'      },
  { id: 'academia',      label: 'Academia / Esporte' },
  { id: 'tecnologia',    label: 'Tecnologia'         },
  { id: 'servicos',      label: 'Serviços'           },
  { id: 'comercio',      label: 'Comércio'           },
  { id: 'saude',         label: 'Saúde'              },
  { id: 'outro',         label: 'Outros'             },
]

// ── Planos contratados ─────────────────────────────────────────────────────
export const PLANOS = {
  basico: {
    id: 'basico',
    label: 'Básico',
    cor: '#6b7280',
    corBg: '#f3f4f6',
    limites: { empresas: 1, usuarios: 3 },
  },
  profissional: {
    id: 'profissional',
    label: 'Profissional',
    cor: '#2563eb',
    corBg: '#eff6ff',
    limites: { empresas: 5, usuarios: 15 },
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    cor: '#7c3aed',
    corBg: '#f5f3ff',
    limites: { empresas: Infinity, usuarios: Infinity },
  },
}

const PLANOS_ORDEM = ['basico', 'profissional', 'enterprise']
const B_P_E = ['basico', 'profissional', 'enterprise']
const P_E   = ['profissional', 'enterprise']
const E     = ['enterprise']

// ── Configuração central de módulos ───────────────────────────────────────
// segmentos: 'todos' → universal; string[] → apenas esses segmentos
// planos: array de planos que têm acesso ao módulo
export const MODULE_CONFIG = {

  // ── Básico+ — disponível em todos os planos ───────────────────────────────
  dashboard:            { segmentos: 'todos', planos: B_P_E, label: 'Dashboard'           },
  receitas:             { segmentos: 'todos', planos: B_P_E, label: 'Receitas'            },
  despesas:             { segmentos: 'todos', planos: B_P_E, label: 'Despesas'            },
  fluxo:                { segmentos: 'todos', planos: B_P_E, label: 'Fluxo de Caixa'      },
  relatorios:           { segmentos: 'todos', planos: B_P_E, label: 'Relatórios'          },
  categorias:           { segmentos: 'todos', planos: B_P_E, label: 'Categorias'          },
  centro_custo:         { segmentos: 'todos', planos: B_P_E, label: 'Centro de Custo'     },
  clientes:             { segmentos: 'todos', planos: B_P_E, label: 'Clientes'            },
  fornecedores:         { segmentos: 'todos', planos: B_P_E, label: 'Fornecedores'        },

  // ── Infraestrutura — sempre disponível ────────────────────────────────────
  usuarios:             { segmentos: 'todos', planos: B_P_E, label: 'Usuários'            },
  configuracoes:        { segmentos: 'todos', planos: B_P_E, label: 'Configurações'       },
  logs:                 { segmentos: 'todos', planos: B_P_E, label: 'Logs do Sistema'     },
  notificacoes:         { segmentos: 'todos', planos: B_P_E, label: 'Notificações'        },
  empresas:             { segmentos: 'todos', planos: B_P_E, label: 'Empresas'            },
  meu_plano:            { segmentos: 'todos', planos: B_P_E, label: 'Meu Plano'          },

  // ── Profissional+ ─────────────────────────────────────────────────────────
  transacoes:           { segmentos: 'todos', planos: P_E,   label: 'Transações'          },
  retirada_socios:      { segmentos: 'todos', planos: P_E,   label: 'Retirada dos Sócios' },
  metas:                { segmentos: 'todos', planos: P_E,   label: 'Metas Financeiras'   },
  mes_fechado:          { segmentos: 'todos', planos: P_E,   label: 'Fechamento Mensal'   },
  comparativo_empresas: { segmentos: 'todos', planos: P_E,   label: 'Comparativo'         },
  importar:             { segmentos: 'todos', planos: P_E,   label: 'Importar'            },
  scanner:              { segmentos: 'todos', planos: P_E,   label: 'Scanner IA'          },
  contas_pagar:         { segmentos: 'todos', planos: P_E,   label: 'Contas a Pagar'      },
  contas_receber:       { segmentos: 'todos', planos: P_E,   label: 'Contas a Receber'    },

  // ── Enterprise — módulos de segmento ──────────────────────────────────────
  viabilidade_inc:  { segmentos: ['incorporadora', 'construtora'],    planos: E, label: 'Viabilidade de Incorporação' },
  controle_obras:   { segmentos: ['incorporadora', 'construtora'],    planos: E, label: 'Controle de Obras'           },
  contratos_obra:   { segmentos: ['incorporadora', 'construtora'],    planos: E, label: 'Contratos de Obra'           },
  investidores:     { segmentos: ['incorporadora', 'construtora'],    planos: E, label: 'Investidores'                },
  captacao_imoveis: { segmentos: ['imobiliaria', 'incorporadora'],    planos: E, label: 'Captação de Imóveis'         },
  crm_vendas:       { segmentos: ['imobiliaria'],                     planos: E, label: 'CRM Imobiliário'            },
  comissoes:        { segmentos: ['imobiliaria', 'incorporadora'],    planos: E, label: 'Comissões'                   },
  planos_alunos:    { segmentos: ['academia', 'saude'],               planos: E, label: 'Planos e Mensalidades'       },
  agendamentos:     { segmentos: ['academia', 'saude'],               planos: E, label: 'Agendamentos'               },
  controle_alunos:  { segmentos: ['academia'],                        planos: E, label: 'Controle de Alunos'         },
  projetos:         { segmentos: ['tecnologia'],                      planos: E, label: 'Projetos'                   },
}

// ── Helpers ────────────────────────────────────────────────────────────────

// Retorna: 'permitido' | 'bloqueado_segmento' | 'bloqueado_plano'
// Segmento oculta; Plano exibe com cadeado
export function getModuloStatus(id, segmento, plano) {
  const cfg = MODULE_CONFIG[id]
  if (!cfg) return 'permitido'

  if (segmento && cfg.segmentos !== 'todos' && !cfg.segmentos.includes(segmento)) {
    return 'bloqueado_segmento'
  }

  if (plano && cfg.planos && !cfg.planos.includes(plano)) {
    return 'bloqueado_plano'
  }

  return 'permitido'
}

export function isModuloPermitido(id, segmento, plano) {
  return getModuloStatus(id, segmento, plano) === 'permitido'
}

export function labelSegmento(id) {
  return SEGMENTOS.find(s => s.id === id)?.label || id || '—'
}

export function labelPlano(id) {
  return PLANOS[id]?.label || id || '—'
}

export function getLimitesPlano(plano) {
  return PLANOS[plano]?.limites || PLANOS.basico.limites
}

export function getCorPlano(plano) {
  return PLANOS[plano]?.cor || '#6b7280'
}

// Retorna o label do plano mínimo que libera este módulo
export function planoMinimoModulo(id) {
  const cfg = MODULE_CONFIG[id]
  if (!cfg || !cfg.planos) return null
  for (const p of PLANOS_ORDEM) {
    if (cfg.planos.includes(p)) return PLANOS[p]?.label || p
  }
  return null
}
