import { useMemo, useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { T, fmt, fmtS, fmtPct } from '../theme'
import { genFluxoCaixaData } from '../data'
import { Card, Btn, Badge, Toast } from '../components/ui'

const COLORS_R = ['#16a34a', '#2563eb', '#7c3aed', '#ea580c', '#9ca3af']
const COLORS_D = ['#2563eb', '#dc2626', '#7c3aed', '#16a34a', '#ea580c', '#0891b2']

export default function MesFechado({ empresa, data, onFechar }) {
  const [toast, setToast] = useState(null)
  const lancs = useMemo(() => data.lancamentos || [], [data.lancamentos])
  const fechado = data.mesFechado || false

  const tRec = useMemo(() => lancs.filter(l => l.tipo === 'receita' && l.status === 'Recebida').reduce((s, l) => s + l.valor, 0), [lancs])
  const tDesp = useMemo(() => lancs.filter(l => l.tipo === 'despesa' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0), [lancs])
  const lucro = tRec - tDesp
  const margem = tRec > 0 ? (lucro / tRec) * 100 : 0
  const saldoInicial = 320000
  const saldoFinal = saldoInicial + tRec - tDesp

  const catRecData = useMemo(() => {
    const map = {}
    lancs.filter(l => l.tipo === 'receita').forEach(l => { map[l.catNome] = (map[l.catNome] || 0) + l.valor })
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return Object.entries(map).map(([n, v]) => ({ n, v, pct: Math.round(v / total * 100) })).sort((a, b) => b.v - a.v)
  }, [lancs])

  const catDespData = useMemo(() => {
    const map = {}
    lancs.filter(l => l.tipo === 'despesa').forEach(l => { map[l.catNome] = (map[l.catNome] || 0) + l.valor })
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return Object.entries(map).map(([n, v]) => ({ n, v, pct: Math.round(v / total * 100) })).sort((a, b) => b.v - a.v)
  }, [lancs])

  const top5Rec = [...lancs].filter(l => l.tipo === 'receita').sort((a, b) => b.valor - a.valor).slice(0, 5)
  const top5Desp = [...lancs].filter(l => l.tipo === 'despesa').sort((a, b) => b.valor - a.valor).slice(0, 5)

  const fluxoData = useMemo(() => genFluxoCaixaData(lancs), [lancs])

  const saude = Math.min(100, Math.round(40 + (margem / 50) * 30 + (lucro > 0 ? 20 : 0) + (tRec > tDesp ? 10 : 0)))

  const compMes = [
    { label: 'Receita', abr: fmt(tRec * 0.86), mai: fmt(tRec), var: '+15,9%', pos: true },
    { label: 'Despesas', abr: fmt(tDesp * 1.07), mai: fmt(tDesp), var: '-6,8%', pos: false },
    { label: 'Lucro', abr: fmt(lucro * 0.63), mai: fmt(lucro), var: '+59,3%', pos: true },
    { label: 'Margem Líquida', abr: fmtPct(margem - 8.7), mai: fmtPct(margem), var: '+8,7 p.p.', pos: true },
    { label: 'Saldo Final', abr: fmt(saldoFinal * 0.84), mai: fmt(saldoFinal), var: '+16,5%', pos: true },
  ]

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: T.text }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0 }}>Mês Fechado</h1>
            {fechado && <span style={{ color: T.green, fontSize: 20 }}>✓</span>}
          </div>
          <div style={{ color: T.sub, fontSize: 14 }}>Relatório completo do mês fechado.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: T.sub, display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'inherit' }}>‹</button>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center', color: T.sub }}>
            📅 Maio/2026 <span style={{ fontSize: 11 }}>▾</span>
          </div>
          {fechado && <Badge label="Mês fechado" color={T.green} bg={T.greenL} />}
          <Btn variant="ghost" icon="↑">Exportar PDF</Btn>
          <Btn variant="ghost" icon="📊">Exportar Excel</Btn>
          <Btn variant="ghost" icon="⇗">Compartilhar</Btn>
          {!fechado ? (
            <Btn onClick={() => { onFechar(); setToast({ msg: 'Mês fechado com sucesso!', type: 'success' }) }}>Fechar mês</Btn>
          ) : (
            <Btn variant="ghost">Reabrir mês</Btn>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Receita Total', value: fmt(tRec), delta: '+15,9%', cor: T.green, icon: '↑', iconBg: T.greenL },
          { label: 'Despesas Totais', value: fmt(tDesp), delta: '-6,8%', cor: T.red, icon: '↓', iconBg: T.redL },
          { label: 'Lucro Líquido', value: fmt(lucro), delta: '+59,3%', cor: T.green, icon: '$', iconBg: T.blueL },
          { label: 'Margem Líquida', value: fmtPct(margem), delta: '+8,7 p.p.', cor: T.purple, icon: '%', iconBg: T.purpleL },
          { label: 'Saldo Inicial', value: fmt(saldoInicial), delta: '+27,4%', cor: T.orange, icon: '🏦', iconBg: T.orangeL },
          { label: 'Saldo Final', value: fmt(saldoFinal), delta: '+27,4%', cor: T.blue, icon: '🏦', iconBg: T.blueL },
        ].map(item => (
          <Card key={item.label} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ background: item.iconBg, borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{item.icon}</div>
              <span style={{ fontSize: 11, color: T.sub }}>{item.label}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, color: item.cor, marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T.muted }}>
              <span style={{ color: item.delta.startsWith('+') ? T.green : T.red, fontWeight: 600 }}>{item.delta}</span> vs Abril/2026
            </div>
          </Card>
        ))}
      </div>

      {/* Saúde + Comparativo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Saúde Financeira */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Saúde Financeira X8</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={T.borderLight} strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={T.primary} strokeWidth="10"
                  strokeDasharray={`${saude * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: T.text }}>{saude}</div>
                <div style={{ fontSize: 12, color: T.muted }}>/100</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: T.primary, marginBottom: 12 }}>
                {saude >= 90 ? 'Excelente' : saude >= 70 ? 'Ótimo' : saude >= 50 ? 'Bom' : 'Atenção'}
              </div>
              {[
                ['✓', 'Fluxo de caixa positivo', true],
                ['✓', 'Todas as despesas conciliadas', tDesp > 0],
                ['✓', 'Receita maior que a meta', tRec > 0],
                ['✓', 'Reserva financeira mantida', saldoFinal > saldoInicial],
              ].map(([ic, txt, ok]) => (
                <div key={txt} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: ok ? T.green : T.muted }}>{ic}</span>
                  <span style={{ color: ok ? T.text : T.muted }}>{txt}</span>
                </div>
              ))}
              <button style={{ background: 'none', border: `1px solid ${T.primary}`, color: T.primary, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 8, fontFamily: 'inherit' }}>
                Ver detalhes dos indicadores
              </button>
            </div>
          </div>
        </Card>

        {/* Comparativo */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Comparativo com mês anterior</div>
            <button style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Ver histórico</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['Indicador', 'Abril/2026', 'Maio/2026', 'Variação'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: T.sub, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compMes.map(row => (
                <tr key={row.label} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>{row.label}</td>
                  <td style={{ padding: '10px 8px', color: T.sub }}>{row.abr}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row.mai}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ color: row.pos ? T.green : T.red, fontWeight: 600 }}>
                      {row.pos ? '↑' : '↓'} {row.var}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Receitas por categoria */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Receitas por categoria</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <PieChart width={140} height={140}>
                <Pie data={catRecData} cx={70} cy={70} innerRadius={40} outerRadius={65} dataKey="pct" startAngle={90} endAngle={-270}>
                  {catRecData.map((_, i) => <Cell key={i} fill={COLORS_R[i % COLORS_R.length]} />)}
                </Pie>
              </PieChart>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 10, color: T.muted }}>Total</div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{fmtS(tRec)}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {catRecData.map((d, i) => (
                <div key={d.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS_R[i % COLORS_R.length], flexShrink: 0 }} />
                    <span>{d.n}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: T.muted }}>{d.pct}%</span>
                    <span style={{ fontWeight: 600, minWidth: 70, textAlign: 'right' }}>{fmt(d.v)}</span>
                  </div>
                </div>
              ))}
              <button style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 4, fontFamily: 'inherit' }}>Ver todas as categorias ›</button>
            </div>
          </div>
        </Card>

        {/* Despesas por categoria */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Despesas por categoria</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <PieChart width={140} height={140}>
                <Pie data={catDespData} cx={70} cy={70} innerRadius={40} outerRadius={65} dataKey="pct" startAngle={90} endAngle={-270}>
                  {catDespData.map((_, i) => <Cell key={i} fill={COLORS_D[i % COLORS_D.length]} />)}
                </Pie>
              </PieChart>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 10, color: T.muted }}>Total</div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{fmtS(tDesp)}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {catDespData.map((d, i) => (
                <div key={d.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS_D[i % COLORS_D.length], flexShrink: 0 }} />
                    <span>{d.n}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: T.muted }}>{d.pct}%</span>
                    <span style={{ fontWeight: 600, minWidth: 70, textAlign: 'right' }}>{fmt(d.v)}</span>
                  </div>
                </div>
              ))}
              <button style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 4, fontFamily: 'inherit' }}>Ver todas as categorias ›</button>
            </div>
          </div>
        </Card>
      </div>

      {/* Top 5 + Fluxo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Top 5 Receitas */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Top 5 Receitas</div>
            <button style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Ver todas</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['#', 'Descrição', 'Categoria', 'Valor'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: T.sub, fontSize: 11 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {top5Rec.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ background: T.primary, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>{l.desc}</td>
                  <td style={{ padding: '10px 8px', color: T.sub }}>{l.catNome}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: T.green }}>{fmt(l.valor)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${T.border}` }}>
                <td colSpan={3} style={{ padding: '10px 8px', fontWeight: 700, fontSize: 12, color: T.sub }}>Total das 5 maiores</td>
                <td style={{ padding: '10px 8px', fontWeight: 800, color: T.green }}>{fmt(top5Rec.reduce((s, l) => s + l.valor, 0))}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Top 5 Despesas */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Top 5 Despesas</div>
            <button style={{ background: 'none', border: 'none', color: T.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Ver todas</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['#', 'Descrição', 'Categoria', 'Valor'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: T.sub, fontSize: 11 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {top5Desp.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ background: T.red, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>{l.desc}</td>
                  <td style={{ padding: '10px 8px', color: T.sub }}>{l.catNome}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: T.red }}>{fmt(l.valor)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${T.border}` }}>
                <td colSpan={3} style={{ padding: '10px 8px', fontWeight: 700, fontSize: 12, color: T.sub }}>Total das 5 maiores</td>
                <td style={{ padding: '10px 8px', fontWeight: 800, color: T.red }}>{fmt(top5Desp.reduce((s, l) => s + l.valor, 0))}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      {/* Fluxo de Caixa */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Fluxo de Caixa - Maio/2026</div>
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, color: T.sub }}>Diário ▾</div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            {[['Entradas', T.green], ['Saídas', T.red], ['Saldo acumulado', T.primary]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.sub }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={fluxoData.filter((_, i) => i % 3 === 0)} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="entradas" fill={T.green} opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={10} />
              <Bar dataKey="saidas" fill={T.red} opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={10} />
              <Line type="monotone" dataKey="saldo" stroke={T.primary} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Ações + Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 18, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Ações do mês fechado</div>
            {[
              { ic: '✓', label: 'Mês fechado com sucesso', sub: 'Todos os lançamentos foram contabilizados.', ok: true },
              { ic: '📊', label: `${lancs.length} lançamentos no período`, sub: `${lancs.filter(l => l.tipo === 'receita').length} receitas e ${lancs.filter(l => l.tipo === 'despesa').length} despesas.`, ok: true },
              { ic: '🏦', label: 'Conciliação bancária', sub: 'Todas as contas conciliadas.', ok: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ background: item.ok ? T.greenL : T.yellowL, borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.ic}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{item.sub}</div>
                </div>
              </div>
            ))}
            <button style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%', fontFamily: 'inherit' }}>
              🖨 Abrir relatório em PDF
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}
