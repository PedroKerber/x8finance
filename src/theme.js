export const T = {
  // Sidebar (own palette in Sidebar.js, these used only in loading screen / legacy)
  sidebar: '#0D2545',
  sidebarHover: '#142d5c',
  sidebarActive: '#142d5c',
  sidebarText: 'rgba(255,255,255,0.5)',
  sidebarTextActive: '#ffffff',

  // Brand / status colors — fixed hex, not affected by theme
  primary: '#F47B20',
  primaryDark: '#D96A10',
  green: '#16a34a',
  red: '#dc2626',
  blue: '#2563eb',
  orange: '#ea580c',
  purple: '#7c3aed',
  yellow: '#ca8a04',
  cyan: '#0891b2',

  // Theme-sensitive: backgrounds, text, borders, shadows, light tints
  bg: 'var(--bg)',
  white: 'var(--card)',
  border: 'var(--border)',
  borderLight: 'var(--border-light)',
  text: 'var(--text)',
  sub: 'var(--text-sub)',
  muted: 'var(--text-muted)',
  shadow: 'var(--shadow)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',

  // Light tint variants (used as badge/pill backgrounds)
  primaryLight: 'var(--primary-light)',
  greenL: 'var(--green-light)',
  redL: 'var(--red-light)',
  blueL: 'var(--blue-light)',
  orangeL: 'var(--orange-light)',
  purpleL: 'var(--purple-light)',
  yellowL: 'var(--yellow-light)',
  cyanL: 'var(--cyan-light)',
}

export const fmt = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtS = v => fmt(v)
export const fmtPct = v => (v || 0).toFixed(1).replace('.', ',') + '%'
export const fd = s => s ? s.split('-').reverse().join('/') : ''
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// Mensagem amigável para falhas de escrita (rede / permissão RLS / trava de mês).
// Reconhece os códigos do Postgres/PostgREST que passarão a aparecer na Etapa 2
// (42501 = violação de RLS; P0001 = exceção da trava de mês fechado).
export const errMsgAcao = (e, fallback = 'Não foi possível concluir a ação. Tente novamente.') => {
  const code = (e && e.code) || ''
  const msg = ((e && e.message) || '').toLowerCase()
  if (code === '42501' || msg.includes('row-level security') || msg.includes('violates row-level') || msg.includes('permission denied')) {
    return 'Você não tem permissão para esta ação.'
  }
  if (code === 'P0001' || msg.includes('fechad')) {
    return (e && e.message) || 'Competência fechada — escrita bloqueada.'
  }
  return fallback
}
