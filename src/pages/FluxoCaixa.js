import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { T, fmt, fmtS } from '../theme'
import { Card, KpiCard } from '../components/ui'
import AdvancedFilters, { defaultFilter, filterLancamentos } from '../components/AdvancedFilters'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const TODAY = new Date().toISOString().slice(0, 10)

function addDays(ds, n) {
  const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}

function buildChart(lancs, inicio, fim, view) {
  const s = new Date(inicio + 'T00:00:00'), e = new Date(fim + 'T00:00:00')
  const pts = []
  let acum = 0

  if (view === 'diario') {
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().slice(0, 10)
      const ent  = lancs.filter(l => l.data === ds && l.tipo === 'receita' && l.status === 'Recebida').reduce((a, l) => a + l.valor, 0)
      const said = lancs.filter(l => l.data === ds && l.tipo === 'despesa' && l.status === 'Paga').reduce((a, l) => a + l.valor, 0)
      acum += ent - said
      pts.push({ dia: ds.slice(5).replace('-', '/'), entradas: ent, saidas: said, saldo: acum })
    }
    return pts.filter((_, i, arr) => arr.length <= 31 || i % Math.ceil(arr.length / 31) === 0)
  }

  if (view === 'semanal') {
    let d = new Date(s)
    while (d <= e) {
      const we = new Date(d); we.setDate(d.getDate() + 6)
      if (we > e) we.setTime(e.getTime())
      const ds = d.toISOString().slice(0, 10), de = we.toISOString().slice(0, 10)
      const ent  = lancs.filter(l => l.data >= ds && l.data <= de && l.tipo === 'receita' && l.status === 'Recebida').reduce((a, l) => a + l.valor, 0)
      const said = lancs.filter(l => l.data >= ds && l.data <= de && l.tipo === 'despesa' && l.status === 'Paga').reduce((a, l) => a + l.valor, 0)
      acum += ent - said
      pts.push({ dia: ds.slice(5).replace('-', '/'), entradas: ent, saidas: said, saldo: acum })
      d.setDate(d.getDate() + 7)
    }
    return pts
  }

  // mensal
  let d = new Date(s.getFullYear(), s.getMonth(), 1)
  while (d <= e) {
    const ym = d.toISOString().slice(0, 7)
    const ent  = lancs.filter(l => l.data && l.data.startsWith(ym) && l.tipo === 'receita' && l.status === 'Recebida').reduce((a, l) => a + l.valor, 0)
    const said = lancs.filter(l => l.data && l.data.startsWith(ym) && l.tipo === 'despesa' && l.status === 'Paga').reduce((a, l) => a + l.valor, 0)
    acum += ent - said
    pts.push({ dia: MESES[d.getMonth()] + '/' + String(d.getFullYear()).slice(2), entradas: ent, saidas: said, saldo: acum })
    d.setMonth(d.getMonth() + 1)
  }
  return pts
}

export default function FluxoCaixa({ data, empresa }) {
  const [filter, setFilter] = useState(defaultFilter)
  const [view, setView]     = useState('diario')

  const allLancs = useMemo(() => data.lancamentos || [], [data.lancamentos])
  const lancs    = useMemo(() => filterLancamentos(allLancs, filter), [allLancs, filter])

  // KPIs — somente efetivados (Recebida / Paga)
  const totalEnt  = lancs.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0)
  const totalSaid = lancs.filter(l => l.tipo === 'despesa' && l.status === 'Paga').reduce((s, l) => s + l.valor, 0)
  const saldoPer  = totalEnt - totalSaid

  // Saldo acumulado: tudo realizado até o fim do período
  const saldoAcum = useMemo(() => allLancs
    .filter(l => l.data && l.data <= filter.fim)
    .reduce((s, l) => {
      if (l.tipo === 'receita' && l.status === 'Recebida') return s + l.valor
      if (l.tipo === 'despesa' && l.status === 'Paga')     return s - l.valor
      return s
    }, 0), [allLancs, filter.fim])

  // Projeções baseadas em lançamentos futuros pendentes
  const proj = useMemo(() => {
    const ranges = [30, 60, 90]
    return ranges.map(days => {
      const ate = addDays(TODAY, days)
      const futLancs = allLancs.filter(l => {
        const v = l.vencimento || l.data || ''
        return v > TODAY && v <= ate
      })
      const ent  = futLancs.filter(l => l.tipo === 'receita' && l.status === 'A receber').reduce((s, l) => s + l.valor, 0)
      const said = futLancs.filter(l => l.tipo === 'despesa' && l.status === 'A Pagar').reduce((s, l) => s + l.valor, 0)
      return { dias: days, ent, said, saldo: saldoAcum + ent - said }
    })
  }, [allLancs, saldoAcum])

  const chartData = useMemo(() => buildChart(lancs, filter.inicio, filter.fim, view), [lancs, filter, view])

  const periodoLabel = `${filter.inicio?.slice(5).replace('-', '/')} a ${filter.fim?.slice(5).replace('-', '/')}`

  const exportExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(chartData.map(r => ({
      'Período': r.dia,
      'Entradas (R$)': r.entradas,
      'Saídas (R$)': r.saidas,
      'Saldo Acumulado (R$)': r.saldo,
    })))
    const wsSumario = XLSX.utils.aoa_to_sheet([
      ['Resumo do Período'],
      ['Entradas realizadas', totalEnt],
      ['Saídas realizadas', totalSaid],
      ['Saldo do período', saldoPer],
      ['Saldo acumulado', saldoAcum],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Fluxo de Caixa')
    XLSX.utils.book_append_sheet(wb, wsSumario, 'Resumo')
    XLSX.writeFile(wb, `fluxo_caixa_${empresa?.nome || 'empresa'}_${filter.inicio}_${filter.fim}.xlsx`)
  }

  const exportPDF = () => {
    const html = `<html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:28px;color:#111}
      h1{font-size:18px;margin:0 0 2px;color:#07140F}
      .sub{color:#666;font-size:12px;margin:0 0 16px}
      .kpis{display:flex;gap:28px;padding:12px 0;border-top:2px solid #07140F;border-bottom:1px solid #e5e7eb;margin-bottom:16px}
      .kpi .kl{font-size:10px;color:#888;margin-bottom:3px;text-transform:uppercase;letter-spacing:.3px}
      .kpi .kv{font-size:15px;font-weight:700}
      table{width:100%;border-collapse:collapse}
      th{background:#f3f4f6;text-align:left;padding:7px 10px;font-size:10px;border-bottom:2px solid #e5e7eb;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
      td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:11px;text-align:right}
      td:first-child{text-align:left;font-weight:600}
      tr:nth-child(even) td{background:#fafafa}
      .pos{color:#16a34a;font-weight:700}.neg{color:#dc2626;font-weight:700}
      @media print{body{margin:16px}}
    </style></head><body>
      <h1>Fluxo de Caixa — ${empresa?.nome || ''}</h1>
      <div class="sub">Período: ${filter.inicio} a ${filter.fim} · Visualização: ${view}</div>
      <div class="kpis">
        <div class="kpi"><div class="kl">Entradas realizadas</div><div class="kv pos">${fmt(totalEnt)}</div></div>
        <div class="kpi"><div class="kl">Saídas realizadas</div><div class="kv neg">${fmt(totalSaid)}</div></div>
        <div class="kpi"><div class="kl">Saldo do período</div><div class="kv ${saldoPer >= 0 ? 'pos' : 'neg'}">${fmt(saldoPer)}</div></div>
        <div class="kpi"><div class="kl">Saldo acumulado</div><div class="kv ${saldoAcum >= 0 ? 'pos' : 'neg'}">${fmt(saldoAcum)}</div></div>
      </div>
      <table>
        <tr><th>Período</th><th style="text-align:right">Entradas</th><th style="text-align:right">Saídas</th><th style="text-align:right">Saldo Acumulado</th></tr>
        ${chartData.map(r => `<tr>
          <td>${r.dia}</td>
          <td class="pos">${fmt(r.entradas)}</td>
          <td class="neg">${fmt(r.saidas)}</td>
          <td class="${r.saldo >= 0 ? 'pos' : 'neg'}">${fmt(r.saldo)}</td>
        </tr>`).join('')}
      </table>
    </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.print() }
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>Fluxo de Caixa</h1>
          <div style={{ color: 'var(--text-sub)', fontSize: 14 }}>Controle de entradas, saídas e saldo acumulado.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', color: 'var(--text-sub)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            📊 Excel
          </button>
          <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', color: 'var(--text-sub)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            📄 PDF
          </button>
        </div>
      </div>

      <AdvancedFilters tipo="all" filter={filter} onApply={setFilter} />

      <div className="g-4" style={{ marginBottom: 22 }}>
        <KpiCard icon="↑" iconBg={T.greenL}  label="Entradas realizadas" value={fmt(totalEnt)} />
        <KpiCard icon="↓" iconBg={T.redL}    label="Saídas realizadas"   value={fmt(totalSaid)} />
        <KpiCard icon="=" iconBg={T.blueL}   label="Saldo do período"    value={fmt(saldoPer)} />
        <KpiCard icon="🏦" iconBg={T.yellowL} label="Saldo acumulado"    value={fmt(saldoAcum)} />
      </div>

      <Card style={{ padding: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Fluxo de Caixa — {periodoLabel}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
              {[['Entradas', T.green], ['Saídas', T.red], ['Saldo acumulado', T.primary]].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-sub)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['diario','Diário'],['semanal','Semanal'],['mensal','Mensal']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? T.primary : 'var(--bg)', color: view === v ? '#fff' : 'var(--text-sub)',
                border: `1px solid ${view === v ? T.primary : 'var(--border)'}`,
                borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: view === v ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--card)', border: `1px solid var(--border)`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="entradas" fill={T.green} opacity={0.85} radius={[3,3,0,0]} maxBarSize={20} name="Entradas" />
              <Bar dataKey="saidas"   fill={T.red}   opacity={0.85} radius={[3,3,0,0]} maxBarSize={20} name="Saídas" />
              <Line type="monotone" dataKey="saldo" stroke={T.primary} strokeWidth={2.5} dot={{ r: 3, fill: T.primary }} name="Saldo" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 14 }}>
            Nenhuma movimentação realizada no período selecionado
          </div>
        )}
      </Card>

      {/* Projeções reais */}
      <div className="g-3">
        {proj.map((p, i) => {
          const cor = [T.green, T.blue, T.purple][i]
          return (
            <Card key={p.dias} style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: cor }}>Projeção {p.dias} dias</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-sub)' }}>A receber (pendentes)</span>
                <span style={{ color: T.green, fontWeight: 600 }}>{fmtS(p.ent)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text-sub)' }}>A pagar (pendentes)</span>
                <span style={{ color: T.red, fontWeight: 600 }}>{fmtS(p.said)}</span>
              </div>
              <div style={{ borderTop: `1px solid var(--border)`, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Saldo projetado</span>
                  <span style={{ fontWeight: 800, color: p.saldo >= 0 ? cor : T.red }}>{fmtS(p.saldo)}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
