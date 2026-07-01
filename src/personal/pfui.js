// ── NORVO · Plano Pessoa Física — componentes visuais premium ───────────────
// Reutilizáveis, alinhados à referência (laranja, cards suaves, valores grandes).
// Presentational only — não contêm regra de negócio.
import { useState } from 'react'

export const PT = {
  orange: '#FF6A00',
  orange2: '#FF8A1C',
  orangeSoft: '#FFEDE0',
  green: '#059669',
  red: '#DC2626',
  orangeGrad: 'linear-gradient(135deg, #FF6A00 0%, #FF8A1C 100%)',
  sidebarGrad: 'linear-gradient(190deg, #0B0F14 0%, #0B0F14 50%, #3a1600 80%, #7a2f00 100%)',
}

// Botão primário/ghost premium
export const PfBtn = ({ children, onClick, ghost, disabled, icon, full, style = {} }) => (
  <button onClick={disabled ? undefined : onClick} disabled={disabled}
    className={ghost ? 'pf-btn pf-btn-ghost' : 'pf-btn'}
    style={{ width: full ? '100%' : 'auto', ...style }}>
    {icon && <span style={{ fontSize: 15 }}>{icon}</span>}{children}
  </button>
)

// Cabeçalho de página padronizado
export const PageHeader = ({ title, subtitle, right, actionLabel, onAction, actionIcon, actionGhost }) => (
  <div className="page-hd" style={{ marginBottom: 22 }}>
    <div>
      <h1 className="pf-h1">{title}</h1>
      {subtitle && <div style={{ color: 'var(--text-sub)', fontSize: 14, marginTop: 3 }}>{subtitle}</div>}
    </div>
    {right || (actionLabel && <PfBtn icon={actionIcon} ghost={actionGhost} onClick={onAction}>{actionLabel}</PfBtn>)}
  </div>
)

// Card de métrica (KPI) — bloco de ícone laranja, valor grande, delta/sub
export const MetricCard = ({ icon, label, value, delta, deltaLabel, sub, gradient, valueColor }) => {
  if (gradient) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: '18px 20px', background: PT.orangeGrad, color: '#fff', boxShadow: '0 10px 26px rgba(255,106,0,0.30)' }}>
        <div style={{ position: 'absolute', right: -18, bottom: -22, fontSize: 120, opacity: 0.14, lineHeight: 1, pointerEvents: 'none' }}>{icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>{icon}</div>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{label}</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{sub}</div>}
      </div>
    )
  }
  const isPos = delta >= 0
  return (
    <div className="pf-card pf-card-hover" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className="pf-ico">{icon}</div>
        <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>{label}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 25, color: valueColor || 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
      {delta !== undefined && delta !== null ? (
        <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 5 }}>
          <span style={{ color: isPos ? PT.green : PT.red, fontWeight: 700 }}>{isPos ? '↑' : '↓'} {Math.abs(delta).toFixed(1).replace('.', ',')}%</span> {deltaLabel || ''}
        </div>
      ) : (sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{sub}</div>)}
    </div>
  )
}

// ── Kit de filtros premium (reutilizável em todas as telas PF) ───────────────
// Componentes presentational; a lógica de filtro continua em cada tela.

// Busca destacada com ícone de lupa.
export const PfSearch = ({ value, onChange, placeholder = 'Buscar…' }) => (
  <div className="pf-search">
    <span className="pf-search-ico" aria-hidden>🔍</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    {value && <button type="button" className="pf-search-clear" onClick={() => onChange('')} aria-label="Limpar busca">✕</button>}
  </div>
)

// Select estilizado (pílula) — mesma API leve dos selects do app.
export const PfSelect = ({ value, onChange, options = [], placeholder, ariaLabel }) => (
  <div className="pf-fselect">
    <select value={value} onChange={onChange} aria-label={ariaLabel || placeholder}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <span className="pf-fselect-caret" aria-hidden>▾</span>
  </div>
)

// Chips rápidos (segmented control) — ex.: status.
export const PfSegment = ({ value, onChange, options = [] }) => (
  <div className="pf-seg">
    {options.map(o => (
      <button key={o.value} type="button"
        className={'pf-seg-chip' + (value === o.value ? ' active' : '')}
        onClick={() => onChange(o.value)}>{o.label}</button>
    ))}
  </div>
)

// Atalhos de período por MÊS (retorna 'YYYY-MM'). Presets + input de mês.
export const PfMonthPeriod = ({ value, onChange, extra = [] }) => {
  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
  const presets = [{ label: 'Este mês', v: thisMonth }, { label: 'Mês passado', v: lastMonth }, ...extra]
  return (
    <div className="pf-period">
      {presets.map(p => (
        <button key={p.v} type="button"
          className={'pf-seg-chip' + (value === p.v ? ' active' : '')}
          onClick={() => onChange(p.v)}>{p.label}</button>
      ))}
      <input type="month" className="pf-period-input" value={value} onChange={e => onChange(e.target.value)} aria-label="Mês" />
    </div>
  )
}

// Atalhos de período por INTERVALO de meses (de/até 'YYYY-MM').
export const PfRangePeriod = ({ de, ate, onChange }) => {
  const now = new Date()
  const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const thisM = ym(now)
  const presets = [
    { label: 'Este mês', d: thisM, a: thisM },
    { label: 'Mês passado', ...(() => { const p = new Date(now.getFullYear(), now.getMonth() - 1, 1); return { d: ym(p), a: ym(p) } })() },
    { label: 'Últimos 3 meses', d: ym(new Date(now.getFullYear(), now.getMonth() - 2, 1)), a: thisM },
    { label: 'Este ano', d: `${now.getFullYear()}-01`, a: thisM },
  ]
  return (
    <div className="pf-period">
      {presets.map(p => (
        <button key={p.label} type="button"
          className={'pf-seg-chip' + (de === p.d && ate === p.a ? ' active' : '')}
          onClick={() => onChange(p.d, p.a)}>{p.label}</button>
      ))}
      <input type="month" className="pf-period-input" value={de} onChange={e => onChange(e.target.value, ate)} aria-label="De" />
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>até</span>
      <input type="month" className="pf-period-input" value={ate} onChange={e => onChange(de, e.target.value)} aria-label="Até" />
    </div>
  )
}

// Barra de filtros premium: busca + segmentos + controles (inline / "Mais filtros") + chips ativos.
export const PfFilterBar = ({ search, onSearch, searchPlaceholder, segments, inline, more, chips, onClear, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  const active = (chips || []).filter(Boolean)
  return (
    <div className="pf-filter">
      <div className="pf-filter-top">
        {onSearch && <PfSearch value={search} onChange={onSearch} placeholder={searchPlaceholder} />}
        {inline}
        {more && (
          <button type="button" className={'pf-more-btn' + (open ? ' active' : '')} onClick={() => setOpen(o => !o)}>
            <span aria-hidden>⚙</span> Filtros{active.length ? ` · ${active.length}` : ''}
          </button>
        )}
      </div>
      {segments && <PfSegment value={segments.value} onChange={segments.onChange} options={segments.options} />}
      {more && open && <div className="pf-filter-more">{more}</div>}
      {active.length > 0 && (
        <div className="pf-active-chips">
          {active.map((c, i) => (
            <span key={i} className="pf-chip">
              {c.label}
              <button type="button" className="pf-chip-x" onClick={c.onRemove} aria-label={`Remover ${c.label}`}>✕</button>
            </span>
          ))}
          {onClear && <button type="button" className="pf-clear" onClick={onClear}>Limpar filtros</button>}
        </div>
      )}
    </div>
  )
}

// Switch premium (on/off) — usado no painel de personalização do Dashboard
export const PfSwitch = ({ checked, onChange, label, hint }) => (
  <label className="pf-cfg-row">
    <span style={{ minWidth: 0 }}>
      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{label}</span>
      {hint && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{hint}</span>}
    </span>
    <span className="pf-switch">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span className="pf-slider" />
    </span>
  </label>
)

// Card de seção (título + conteúdo) com estilo premium
export const SectionCard = ({ title, right, children, style = {}, bodyStyle = {} }) => (
  <div className="pf-card" style={{ padding: 20, ...style }}>
    {(title || right) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        {title && <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{title}</div>}
        {right}
      </div>
    )}
    <div style={bodyStyle}>{children}</div>
  </div>
)
