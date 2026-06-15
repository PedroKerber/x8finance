export const T = {
  sidebar: '#0d2318',
  sidebarHover: '#1a3529',
  sidebarActive: '#1e4030',
  sidebarText: '#7db894',
  sidebarTextActive: '#ffffff',
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#dcfce7',
  bg: '#f0f4f1',
  white: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  text: '#111827',
  sub: '#6b7280',
  muted: '#9ca3af',
  green: '#16a34a',
  greenL: '#dcfce7',
  red: '#dc2626',
  redL: '#fee2e2',
  blue: '#2563eb',
  blueL: '#dbeafe',
  orange: '#ea580c',
  orangeL: '#ffedd5',
  purple: '#7c3aed',
  purpleL: '#ede9fe',
  yellow: '#ca8a04',
  yellowL: '#fef9c3',
  cyan: '#0891b2',
  cyanL: '#cffafe',
  shadow: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 10px 25px rgba(0,0,0,0.1)',
}

export const fmt = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtS = v => {
  const n = v || 0
  if (Math.abs(n) >= 1e6) return 'R$ ' + (n / 1e6).toFixed(2).replace('.', ',') + 'M'
  if (Math.abs(n) >= 1e3) return 'R$ ' + (n / 1e3).toFixed(0) + 'k'
  return fmt(n)
}
export const fmtPct = v => (v || 0).toFixed(1).replace('.', ',') + '%'
export const fd = s => s ? s.split('-').reverse().join('/') : ''
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
