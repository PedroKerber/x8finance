import { useMemo, useState } from 'react'
import {
  ComposedChart, Bar, Line, BarChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { T, fmt, fmtPct } from '../theme'
import { useMobile } from '../context/MobileContext'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const PERIODOS = [
  { id: 'mes', label: 'Este Mês' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'ano', label: 'Este Ano' },
]

const RANK_OPTS = [
  { id: 'receita', label: 'Faturamento' },
  { id: 'lucro', label: 'Lucro' },
  { id: 'margem', label: 'Margem' },
  { id: 'caixa', label: 'Caixa' },
]

function getRange(periodo) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  if (periodo === 'mes') {
    const last = new Date(y, m + 1, 0).getDate()
    return {
      inicio: `${y}-${String(m+1).padStart(2,'0')}-01`,
      fim: `${y}-${String(m+1).padStart(2,'0')}-${String(last).padStart(2,'0')}`,
    }
  }
  if (periodo === 'trimestre') {
    const qs = m - (m % 3), qe = qs + 2
    const last = new Date(y, qe + 1, 0).getDate()
    return {
      inicio: `${y}-${String(qs+1).padStart(2,'0')}-01`,
      fim: `${y}-${String(qe+1).padStart(2,'0')}-${String(last).padStart(2,'0')}`,
    }
  }
  return { inicio: `${y}-01-01`, fim: `${y}-12-31` }
}

function prevRange(inicio, fim) {
  const s = new Date(inicio + 'T00:00:00'), e = new Date(fim + 'T00:00:00')
  const dur = e - s + 86400000
  const pe = new Date(s - 86400000)
  const ps = new Date(pe - dur + 86400000)
  return { inicio: ps.toISOString().slice(0,10), fim: pe.toISOString().slice(0,10) }
}

function delta(curr, prev) {
  if (!prev || prev === 0) return null
  return ((curr - prev) / Math.abs(prev)) * 100
}

function buildFluxo(lancs, inicio, fim) {
  const sD = new Date(inicio + 'T00:00:00')
  const eD = new Date(fim + 'T00:00:00')
  const days = Math.round((eD - sD) / 86400000) + 1
  let saldo = 0
  const pts = []

  if (days <= 32) {
    for (let d = new Date(sD); d <= eD; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().slice(0, 10)
      const dl = lancs.filter(l => l.data === ds)
      const ent = dl.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0)
      const sai = dl.filter(l => (l.tipo === 'despesa' && (l.status === 'Paga' || l.status === 'Pago')) || l.tipo === 'retirada').reduce((s, l) => s + l.valor, 0)
      saldo += ent - sai
      pts.push({ label: String(d.getDate()).padStart(2,'0'), entradas: ent, saidas: sai, saldo })
    }
  } else {
    let d = new Date(sD.getFullYear(), sD.getMonth(), 1)
    while (d <= eD) {
      const ym = d.toISOString().slice(0, 7)
      const ml = lancs.filter(l => l.data?.startsWith(ym))
      const ent = ml.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0)
      const sai = ml.filter(l => (l.tipo === 'despesa' && (l.status === 'Paga' || l.status === 'Pago')) || l.tipo === 'retirada').reduce((s, l) => s + l.valor, 0)
      saldo += ent - sai
      pts.push({ label: MESES[d.getMonth()], entradas: ent, saidas: sai, saldo })
      d.setMonth(d.getMonth() + 1)
    }
  }
  return pts
}

function DeltaBadge({ value, invert }) {
  if (value === null || value === undefined) return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
  const good = invert ? value <= 0 : value >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: good ? '#dcfce7' : '#fee2e2',
      color: good ? '#15803d' : '#dc2626',
    }}>
      {value >= 0 ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function KpiCard({ label, value, deltaVal, invert, sub, onClick, accent }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 14, padding: '20px 22px',
      border: '1px solid var(--border)',
      borderTop: accent ? `3px solid ${T.primary}` : '1px solid var(--border)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow .15s, transform .15s',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' } }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 14 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -.3, marginBottom: 10 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <DeltaBadge value={deltaVal} invert={invert} />
        {sub && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  )
}

function FluxoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: 'var(--text-sub)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  )
}

function CatTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 600 }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

function SectionHead({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      {action}
    </div>
  )
}

function LinkBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
      {label} →
    </button>
  )
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
      border: active ? 'none' : '1px solid var(--border)',
      background: active ? T.primary : 'var(--card)',
      color: active ? '#fff' : 'var(--text-sub)', cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all .15s',
    }}>{label}</button>
  )
}

export default function Dashboard({ empresa, data, setPage, allData = {}, allEmpresas = [] }) {
  const isMobile = useMobile()
  const [periodo, setPeriodo] = useState('mes')
  const [rankTipo, setRankTipo] = useState('receita')

  const range = useMemo(() => getRange(periodo), [periodo])
  const prev = useMemo(() => prevRange(range.inicio, range.fim), [range])

  const lancs = useMemo(() => data.lancamentos || [], [data.lancamentos])

  const filtered = useMemo(() => lancs.filter(l => l.data >= range.inicio && l.data <= range.fim), [lancs, range])
  const prevFiltered = useMemo(() => lancs.filter(l => l.data >= prev.inicio && l.data <= prev.fim), [lancs, prev])

  // KPIs atuais
  const { tRec, tDesp, tRet } = useMemo(() => ({
    tRec: filtered.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0),
    tDesp: filtered.filter(l => l.tipo === 'despesa' && (l.status === 'Paga' || l.status === 'Pago')).reduce((s, l) => s + l.valor, 0),
    tRet: filtered.filter(l => l.tipo === 'retirada').reduce((s, l) => s + l.valor, 0),
  }), [filtered])

  const lucro = tRec - tDesp
  const caixa = lucro - tRet

  // KPIs período anterior
  const { pRec, pDesp, pRet } = useMemo(() => ({
    pRec: prevFiltered.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0),
    pDesp: prevFiltered.filter(l => l.tipo === 'despesa' && (l.status === 'Paga' || l.status === 'Pago')).reduce((s, l) => s + l.valor, 0),
    pRet: prevFiltered.filter(l => l.tipo === 'retirada').reduce((s, l) => s + l.valor, 0),
  }), [prevFiltered])

  const pLucro = pRec - pDesp
  const pCaixa = pLucro - pRet

  // Fluxo
  const fluxo = useMemo(() => buildFluxo(lancs, range.inicio, range.fim), [lancs, range])
  const fluxoTot = useMemo(() => fluxo.reduce((acc, d) => ({ ent: acc.ent + d.entradas, sai: acc.sai + d.saidas }), { ent: 0, sai: 0 }), [fluxo])

  // Categorias
  const despCats = useMemo(() => {
    const map = {}
    filtered.filter(l => l.tipo === 'despesa').forEach(l => { map[l.catNome || 'Outros'] = (map[l.catNome || 'Outros'] || 0) + l.valor })
    return Object.entries(map).map(([n, v]) => ({ n: n.length > 22 ? n.slice(0,20)+'…' : n, v })).sort((a, b) => b.v - a.v).slice(0, 6)
  }, [filtered])

  const recCats = useMemo(() => {
    const map = {}
    filtered.filter(l => l.tipo === 'receita').forEach(l => { map[l.catNome || 'Outros'] = (map[l.catNome || 'Outros'] || 0) + l.valor })
    return Object.entries(map).map(([n, v]) => ({ n: n.length > 22 ? n.slice(0,20)+'…' : n, v })).sort((a, b) => b.v - a.v).slice(0, 6)
  }, [filtered])

  // Ranking multi-empresa
  const empRanking = useMemo(() => {
    if (!allEmpresas.length) return []
    return allEmpresas.map(emp => {
      const eLancs = allData[emp.id]?.lancamentos || []
      const inP = eLancs.filter(l => l.data >= range.inicio && l.data <= range.fim)
      const rec = inP.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0)
      const dep = inP.filter(l => l.tipo === 'despesa' && (l.status === 'Paga' || l.status === 'Pago')).reduce((s, l) => s + l.valor, 0)
      const ret = inP.filter(l => l.tipo === 'retirada').reduce((s, l) => s + l.valor, 0)
      const lu = rec - dep
      const cx = lu - ret
      const mg = rec > 0 ? (lu / rec) * 100 : 0
      const pP = eLancs.filter(l => l.data >= prev.inicio && l.data <= prev.fim)
      const pR = pP.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0)
      return { ...emp, receita: rec, despesa: dep, lucro: lu, caixa: cx, margem: mg, delta: delta(rec, pR) }
    }).sort((a, b) => {
      if (rankTipo === 'lucro') return b.lucro - a.lucro
      if (rankTipo === 'margem') return b.margem - a.margem
      if (rankTipo === 'caixa') return b.caixa - a.caixa
      return b.receita - a.receita
    })
  }, [allData, allEmpresas, range, prev, rankTipo])

  const melhorEmp = empRanking[0] || null

  // Insights
  const insights = useMemo(() => {
    const items = []
    const dRec = delta(tRec, pRec)
    if (dRec !== null)
      items.push({ texto: `Receitas ${dRec >= 0 ? 'cresceram' : 'caíram'} ${Math.abs(dRec).toFixed(1)}% em relação ao período anterior.`, pos: dRec >= 0 })
    const margem = tRec > 0 ? (lucro / tRec) * 100 : 0
    if (tRec > 0)
      items.push({ texto: `Margem líquida de ${fmtPct(margem)} no período.`, pos: margem > 15 })
    if (melhorEmp && melhorEmp.receita > 0)
      items.push({ texto: `${melhorEmp.nome} lidera o faturamento do grupo com ${fmt(melhorEmp.receita)}.`, pos: true })
    const topDesp = despCats[0]
    if (topDesp)
      items.push({ texto: `${topDesp.n} representa a maior concentração de despesas.`, pos: null })
    items.push({ texto: lucro >= 0 ? `Resultado positivo de ${fmt(lucro)} no período.` : `Resultado negativo de ${fmt(Math.abs(lucro))} — revisão de custos recomendada.`, pos: lucro >= 0 })
    return items.slice(0, 4)
  }, [tRec, pRec, lucro, melhorEmp, despCats])

  const recentes = useMemo(() => [...filtered].sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, 6), [filtered])
  const metas = data.metas || []

  const now = new Date()
  const periodoLabel = `${MESES[now.getMonth()]} ${now.getFullYear()}`

  const col2 = isMobile ? '1fr' : '1fr 1fr'
  const col3 = isMobile ? '1fr' : '1fr 360px'

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: 'var(--text)', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Dashboard</h1>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>{empresa?.nome} · {periodoLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODOS.map(p => <Pill key={p.id} label={p.label} active={periodo === p.id} onClick={() => setPeriodo(p.id)} />)}
        </div>
      </div>

      {/* ── LINHA 1: KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Receita Total" value={fmt(tRec)} deltaVal={delta(tRec, pRec)} sub="vs. período anterior" />
        <KpiCard label="Despesas Totais" value={fmt(tDesp)} deltaVal={delta(tDesp, pDesp)} invert sub="vs. período anterior" />
        <KpiCard label="Lucro Líquido" value={fmt(lucro)} deltaVal={delta(lucro, pLucro)} sub="vs. período anterior" />
        <KpiCard label="Caixa Disponível" value={fmt(caixa)} deltaVal={delta(caixa, pCaixa)} sub="após retiradas" />
        <KpiCard
          label="Empresa Destaque"
          value={melhorEmp ? fmt(melhorEmp.receita) : '—'}
          deltaVal={melhorEmp?.delta ?? null}
          sub={melhorEmp?.nome || 'Sem dados'}
          onClick={melhorEmp ? () => setPage('comparativo_empresas') : undefined}
          accent
        />
      </div>

      {/* ── LINHA 2: FLUXO DE CAIXA ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 24, overflow: 'hidden' }}>
        <SectionHead title="Fluxo de Caixa" action={<LinkBtn label="Ver completo" onClick={() => setPage('fluxo')} />} />
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', gap: 28, marginBottom: 18, flexWrap: 'wrap' }}>
            {[['Entradas', T.green, fluxoTot.ent], ['Saídas', T.red, fluxoTot.sai], ['Saldo', T.blue, fluxoTot.ent - fluxoTot.sai]].map(([l, c, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: c }}>{fmt(v)}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={fluxo} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<FluxoTooltip />} />
              <Bar dataKey="entradas" name="Entradas" fill={T.green} opacity={0.7} radius={[3,3,0,0]} maxBarSize={14} />
              <Bar dataKey="saidas" name="Saídas" fill={T.red} opacity={0.7} radius={[3,3,0,0]} maxBarSize={14} />
              <Line type="monotone" dataKey="saldo" name="Saldo" stroke={T.blue} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── LINHA 3: PERFORMANCE + INSIGHTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: col3, gap: 16, marginBottom: 24 }}>

        {/* Central de Performance */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <SectionHead
            title="Central de Performance"
            action={
              <button onClick={() => setPage('comparativo_empresas')} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>Comparativo Completo</button>
            }
          />
          <div style={{ display: 'flex', gap: 6, padding: '12px 20px 8px', flexWrap: 'wrap' }}>
            {RANK_OPTS.map(o => <Pill key={o.id} label={o.label} active={rankTipo === o.id} onClick={() => setRankTipo(o.id)} />)}
          </div>
          <div>
            {empRanking.length === 0 && (
              <div style={{ padding: '24px 20px', color: 'var(--text-sub)', fontSize: 13 }}>Sem dados de empresas no período.</div>
            )}
            {empRanking.map((emp, i) => {
              const val = rankTipo === 'lucro' ? emp.lucro : rankTipo === 'margem' ? emp.margem : rankTipo === 'caixa' ? emp.caixa : emp.receita
              const isMargem = rankTipo === 'margem'
              return (
                <div key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
                  borderTop: '1px solid var(--border-light)',
                }}>
                  <div style={{ width: 20, fontSize: 13, fontWeight: 700, color: i === 0 ? T.primary : 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: emp.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                    {emp.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{emp.setor}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: val < 0 ? T.red : 'var(--text)' }}>
                      {isMargem ? fmtPct(val) : fmt(val)}
                    </div>
                    {emp.delta !== null && <DeltaBadge value={emp.delta} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights + Metas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Insights */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', flex: 1 }}>
            <SectionHead title="Insights Executivos" action={null} />
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: ins.pos === null ? 'var(--text-sub)' : ins.pos ? T.green : T.red }} />
                  <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{ins.texto}</span>
                </div>
              ))}
              {insights.length === 0 && <div style={{ color: 'var(--text-sub)', fontSize: 13 }}>Sem dados no período.</div>}
            </div>
          </div>

          {/* Metas rápidas */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <SectionHead title="Metas" action={<LinkBtn label="Gerenciar" onClick={() => setPage('metas')} />} />
            <div style={{ padding: '16px 20px' }}>
              {metas.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ color: 'var(--text-sub)', fontSize: 13 }}>Nenhuma meta cadastrada.</div>
                  <button onClick={() => setPage('metas')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
                    Criar Meta
                  </button>
                </div>
              )}
              {metas.slice(0, 2).map(m => {
                const pct = Math.min(100, Math.round((m.acumulado || 0) / (m.objetivo || 1) * 100))
                const tipos = { receita: 'Receita', lucro: 'Lucro', margem: 'Margem' }
                return (
                  <div key={m.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{tipos[m.tipo] || 'Meta'}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? T.green : T.primary }}>{pct}%</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: pct >= 100 ? T.green : T.primary, height: '100%', width: pct + '%', borderRadius: 6, transition: 'width .6s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── LINHA 4: CATEGORIAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 16, marginBottom: 24 }}>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <SectionHead title="Despesas por Categoria" action={<LinkBtn label="Relatório" onClick={() => setPage('relatorios')} />} />
          <div style={{ padding: '16px 20px' }}>
            {despCats.length === 0
              ? <div style={{ color: 'var(--text-sub)', fontSize: 13 }}>Nenhuma despesa no período.</div>
              : <ResponsiveContainer width="100%" height={Math.max(160, despCats.length * 36)}>
                  <BarChart data={despCats} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="n" width={140} tick={{ fontSize: 11, fill: 'var(--text-sub)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CatTooltip />} />
                    <Bar dataKey="v" name="Valor" fill={T.red} radius={[0,4,4,0]} opacity={0.8} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <SectionHead title="Receitas por Categoria" action={<LinkBtn label="Relatório" onClick={() => setPage('relatorios')} />} />
          <div style={{ padding: '16px 20px' }}>
            {recCats.length === 0
              ? <div style={{ color: 'var(--text-sub)', fontSize: 13 }}>Nenhuma receita no período.</div>
              : <ResponsiveContainer width="100%" height={Math.max(160, recCats.length * 36)}>
                  <BarChart data={recCats} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="n" width={140} tick={{ fontSize: 11, fill: 'var(--text-sub)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CatTooltip />} />
                    <Bar dataKey="v" name="Valor" fill={T.green} radius={[0,4,4,0]} opacity={0.8} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>
      </div>

      {/* ── LINHA 5: TRANSAÇÕES ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <SectionHead title="Últimas Transações" action={<LinkBtn label="Ver todas" onClick={() => setPage('transacoes')} />} />
        <div>
          {recentes.length === 0 && (
            <div style={{ padding: '24px 20px', color: 'var(--text-sub)', fontSize: 13 }}>Nenhuma transação no período.</div>
          )}
          {recentes.map((l, i) => {
            const isR = l.tipo === 'receita'
            const cor = l.tipo === 'retirada' ? T.purple : isR ? T.green : T.red
            return (
              <div key={l.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderTop: i > 0 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{l.catNome} · {l.data?.split('-').reverse().join('/')}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: cor, flexShrink: 0 }}>
                  {isR ? '+' : '-'}{fmt(l.valor)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
