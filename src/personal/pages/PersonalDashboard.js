import { useMemo } from 'react'
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import { T, fmt, fmtS, fmtPct, fd } from '../../theme'
import { Card, KpiCard, EmptyState } from '../../components/ui'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const somaMes = (txs, mes, tipo) => txs.filter(t => t.tipo === tipo && (t.data || '').startsWith(mes)).reduce((s, t) => s + (t.valor || 0), 0)

export default function PersonalDashboard({ usuario, profile, accounts, transactions, cards = [], investments = [], debts = [], goals = [], catsDespesa = [], snapshots = [] }) {
  const hoje = new Date()
  const mesAtual = hoje.toISOString().slice(0, 7)
  const prevDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const mesPrev = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const recMes  = useMemo(() => somaMes(transactions, mesAtual, 'receita'), [transactions, mesAtual])
  const despMes = useMemo(() => somaMes(transactions, mesAtual, 'despesa'), [transactions, mesAtual])
  const recPrev  = useMemo(() => somaMes(transactions, mesPrev, 'receita'), [transactions, mesPrev])
  const despPrev = useMemo(() => somaMes(transactions, mesPrev, 'despesa'), [transactions, mesPrev])
  const economia = recMes - despMes
  const saldoContas = useMemo(() => accounts.reduce((s, a) => s + (a.saldoAtual || 0), 0), [accounts])

  // Investimentos / Dívidas / Cartão (F2) — dados reais do Supabase
  const totalInvest = useMemo(() => investments.reduce((s, i) => s + (i.current || 0), 0), [investments])
  const totalDividas = useMemo(() => debts.filter(d => d.status !== 'quitada').reduce((s, d) => s + (d.remaining || 0), 0), [debts])
  const faturaCartao = useMemo(() => transactions.filter(t => t.tipo === 'despesa' && t.cartaoId && (t.data || '').startsWith(mesAtual)).reduce((s, t) => s + (t.valor || 0), 0), [transactions, mesAtual])
  const patrimonio = saldoContas + totalInvest - totalDividas

  const delta = (cur, prev) => prev > 0 ? ((cur - prev) / prev) * 100 : (cur > 0 ? 100 : 0)

  // Série dos últimos 6 meses (Receitas x Despesas + saldo mensal)
  const serie6 = useMemo(() => {
    const arr = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const rec = somaMes(transactions, mes, 'receita')
      const desp = somaMes(transactions, mes, 'despesa')
      arr.push({ mes: MESES[d.getMonth()], receitas: rec, despesas: desp, saldo: rec - desp })
    }
    return arr
  }, [transactions]) // eslint-disable-line react-hooks/exhaustive-deps

  // Gastos por categoria no mês atual
  const catDesp = useMemo(() => {
    const map = {}
    transactions.filter(t => t.tipo === 'despesa' && (t.data || '').startsWith(mesAtual))
      .forEach(t => { map[t.categoria] = (map[t.categoria] || 0) + (t.valor || 0) })
    return Object.entries(map).map(([id, v]) => ({
      nome: catsDespesa.find(c => c.id === id)?.nome || id,
      cor: catsDespesa.find(c => c.id === id)?.cor || T.muted, valor: v,
    })).sort((a, b) => b.valor - a.valor)
  }, [transactions, mesAtual, catsDespesa])

  // Evolução patrimonial (F3) — a partir dos snapshots mensais reais
  const evoPat = useMemo(() => snapshots.map(s => {
    const [y, mo] = (s.date || '').split('-')
    return { mes: `${MESES[+mo - 1]}/${(y || '').slice(2)}`, patrimonio: s.netWorth }
  }), [snapshots])
  const maiorPat = snapshots.length ? Math.max(...snapshots.map(s => s.netWorth)) : patrimonio
  const menorPat = snapshots.length ? Math.min(...snapshots.map(s => s.netWorth)) : patrimonio
  const patPrev = snapshots.length >= 2 ? snapshots[snapshots.length - 2].netWorth : null
  const varPat = patPrev != null ? patrimonio - patPrev : 0
  const varPatPct = patPrev ? (varPat / Math.abs(patPrev)) * 100 : 0

  // Alertas inteligentes (regras simples, dados reais)
  const hojeStr = hoje.toISOString().slice(0, 10)
  const alertas = []
  accounts.filter(a => (a.saldoAtual || 0) < 0).forEach(a => alertas.push({ tipo: 'danger', icon: '🏦', msg: `Conta "${a.nome}" com saldo negativo (${fmt(a.saldoAtual)}).` }))
  debts.filter(d => d.status !== 'quitada' && (d.status === 'atrasada' || (d.dueDate && d.dueDate < hojeStr)))
    .forEach(d => alertas.push({ tipo: 'danger', icon: '⚠️', msg: `Dívida com ${d.creditor} atrasada${d.dueDate ? ` (venceu ${fd(d.dueDate)})` : ''}.` }))
  debts.filter(d => d.status !== 'quitada' && d.dueDate && d.dueDate >= hojeStr && (new Date(d.dueDate) - hoje) / 86400000 <= 7)
    .forEach(d => alertas.push({ tipo: 'warn', icon: '📅', msg: `Dívida com ${d.creditor} vence em ${fd(d.dueDate)}.` }))
  cards.filter(c => c.isActive && c.dueDay).forEach(c => {
    let diff = c.dueDay - hoje.getDate(); if (diff < 0) diff += 30
    if (diff <= 5) alertas.push({ tipo: 'warn', icon: '💳', msg: `Fatura do cartão "${c.name}" vence dia ${c.dueDay}.` })
  })
  if (recMes > 0 && despMes > recMes) alertas.push({ tipo: 'warn', icon: '📉', msg: `Despesas do mês (${fmtS(despMes)}) acima das receitas (${fmtS(recMes)}).` })
  goals.filter(g => g.status === 'ativa' && g.target > 0).forEach(g => {
    const p = g.current / g.target * 100
    if (p >= 80 && p < 100) alertas.push({ tipo: 'info', icon: '🎯', msg: `Meta "${g.name}" está a ${Math.round(100 - p)}% de ser concluída.` })
  })
  if (patrimonio < 0) alertas.push({ tipo: 'danger', icon: '💎', msg: `Seu patrimônio líquido está negativo (${fmtS(patrimonio)}).` })
  const alertaBg = { danger: T.redL, warn: T.orangeL, info: T.blueL }
  const alertaCor = { danger: T.red, warn: T.orange, info: T.blue }

  // Resumo do mês
  const maiorCatDesp = catDesp[0] || null
  const temPrev = recPrev > 0 || despPrev > 0
  const curSnap = snapshots[snapshots.length - 1] || null
  const prevSnap = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const investMesDelta = prevSnap && curSnap ? (curSnap.investments - prevSnap.investments) : null
  const dividaMesReducao = prevSnap && curSnap ? (prevSnap.debts - curSnap.debts) : null

  const temDados = transactions.length > 0 || accounts.length > 0
  const primeiroNome = (profile?.nome || usuario?.nome || '').split(' ')[0]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, color: T.text }}>Olá{primeiroNome ? `, ${primeiroNome}` : ''} 👋</h1>
        <div style={{ color: T.sub, fontSize: 14, marginTop: 2 }}>Sua visão financeira pessoal — {MESES[hoje.getMonth()]}/{hoje.getFullYear()}.</div>
      </div>

      {/* Alertas inteligentes */}
      {alertas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 18 }}>
          {alertas.slice(0, 6).map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: alertaBg[a.tipo], border: `1px solid ${alertaCor[a.tipo]}33`, borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
              <span style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {!temDados ? (
        <Card style={{ padding: 0 }}>
          <EmptyState icon="✨" title="Bem-vindo ao seu Norvo Pessoal"
            sub="Comece cadastrando uma conta e seus primeiros lançamentos." />
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
            <KpiCard icon="📈" iconBg={T.greenL} label="Receitas do mês" value={fmt(recMes)} delta={delta(recMes, recPrev)} deltaLabel="vs mês anterior" />
            <KpiCard icon="📉" iconBg={T.redL} label="Despesas do mês" value={fmt(despMes)} delta={delta(despMes, despPrev)} deltaLabel="vs mês anterior" />
            <KpiCard icon="🐷" iconBg={T.blueL} label="Economia do mês" value={fmt(economia)} sub={economia >= 0 ? 'Você fechou no positivo' : 'Gastos acima da renda'} />
            <KpiCard icon="🏦" iconBg={T.primaryLight} label="Saldo em contas" value={fmt(saldoContas)} sub={`${accounts.length} conta(s)`} />
            <KpiCard icon="💹" iconBg={T.purpleL} label="Investimentos" value={fmt(totalInvest)} sub="Patrimônio atual" />
            <KpiCard icon="💳" iconBg={T.orangeL} label="Cartão (fatura)" value={fmt(faturaCartao)} sub="Fatura do mês" />
            <KpiCard icon="📊" iconBg={T.redL} label="Dívidas" value={fmt(totalDividas)} sub="Saldo devedor" />
            <KpiCard icon="💎" iconBg={T.cyanL} label="Patrimônio líquido" value={fmt(patrimonio)} sub="Contas + investimentos − dívidas" />
          </div>

          {/* Resumo do mês */}
          <Card style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: T.text }}>Resumo do mês — {MESES[hoje.getMonth()]}/{hoje.getFullYear()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: T.sub }}>Receitas</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: T.green }}>{fmt(recMes)}</div>
                {temPrev && <div style={{ fontSize: 11, color: delta(recMes, recPrev) >= 0 ? T.green : T.red }}>{delta(recMes, recPrev) >= 0 ? '↑' : '↓'} {fmtPct(Math.abs(delta(recMes, recPrev)))} vs mês ant.</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.sub }}>Despesas</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: T.red }}>{fmt(despMes)}</div>
                {temPrev && <div style={{ fontSize: 11, color: delta(despMes, despPrev) <= 0 ? T.green : T.red }}>{delta(despMes, despPrev) >= 0 ? '↑' : '↓'} {fmtPct(Math.abs(delta(despMes, despPrev)))} vs mês ant.</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.sub }}>Saldo do mês</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: economia >= 0 ? T.green : T.red }}>{fmt(economia)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.sub }}>Maior gasto</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{maiorCatDesp ? maiorCatDesp.nome : '—'}</div>
                {maiorCatDesp && <div style={{ fontSize: 12, color: T.muted }}>{fmtS(maiorCatDesp.valor)}</div>}
              </div>
              {investMesDelta != null && (
                <div>
                  <div style={{ fontSize: 12, color: T.sub }}>Investimentos (mês)</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: investMesDelta >= 0 ? T.green : T.red }}>{investMesDelta >= 0 ? '+' : '−'}{fmtS(Math.abs(investMesDelta))}</div>
                </div>
              )}
              {dividaMesReducao != null && dividaMesReducao !== 0 && (
                <div>
                  <div style={{ fontSize: 12, color: T.sub }}>Dívidas (mês)</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: dividaMesReducao >= 0 ? T.green : T.red }}>{dividaMesReducao >= 0 ? '−' : '+'}{fmtS(Math.abs(dividaMesReducao))}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{dividaMesReducao >= 0 ? 'reduziu' : 'aumentou'}</div>
                </div>
              )}
            </div>
            {!temPrev && <div style={{ marginTop: 12, background: T.bg, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: T.muted }}>Sem dados do mês anterior para comparar — os comparativos aparecem assim que houver histórico.</div>}
          </Card>

          {/* Gráficos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: T.text }}>Receitas × Despesas (6 meses)</div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={serie6} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="mes" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="receitas" name="Receitas" fill={T.green} radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="despesas" name="Despesas" fill={T.red} radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Line type="monotone" dataKey="saldo" name="Saldo" stroke={T.primary} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: T.text }}>Gastos por categoria — {MESES[hoje.getMonth()]}</div>
              {catDesp.length === 0 ? (
                <EmptyState icon="🧾" title="Sem despesas neste mês" />
              ) : (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <PieChart width={160} height={160}>
                    <Pie data={catDesp} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="valor" nameKey="nome" startAngle={90} endAngle={-270}>
                      {catDesp.map((c, i) => <Cell key={i} fill={c.cor} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    {catDesp.slice(0, 6).map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 12 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.cor, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                        </span>
                        <span style={{ fontWeight: 600, color: T.text, flexShrink: 0 }}>{fmtS(c.valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Evolução Patrimonial (F3) — snapshots mensais reais */}
          <Card style={{ padding: 20, marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Evolução Patrimonial</div>
              <div style={{ fontSize: 12, color: T.muted }}>Patrimônio = contas + investimentos − dívidas</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 12, color: T.sub }}>Atual</div><div style={{ fontWeight: 800, fontSize: 20, color: patrimonio >= 0 ? T.green : T.red }}>{fmt(patrimonio)}</div></div>
              <div><div style={{ fontSize: 12, color: T.sub }}>Maior registrado</div><div style={{ fontWeight: 800, fontSize: 20, color: T.text }}>{fmt(maiorPat)}</div></div>
              <div><div style={{ fontSize: 12, color: T.sub }}>Menor registrado</div><div style={{ fontWeight: 800, fontSize: 20, color: T.text }}>{fmt(menorPat)}</div></div>
              <div>
                <div style={{ fontSize: 12, color: T.sub }}>Variação (mês ant.)</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: varPat >= 0 ? T.green : T.red }}>{patPrev == null ? '—' : `${varPat >= 0 ? '↑' : '↓'} ${fmt(Math.abs(varPat))}`}</div>
                {patPrev != null && <div style={{ fontSize: 12, color: varPat >= 0 ? T.green : T.red }}>{fmtPct(varPatPct)}</div>}
              </div>
            </div>
            {evoPat.length < 2 ? (
              <div style={{ background: T.bg, borderRadius: 8, padding: '12px 14px', fontSize: 13, color: T.muted }}>
                O histórico do patrimônio começou a ser registrado agora. Volte nos próximos meses para acompanhar a curva de evolução.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={evoPat} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="mes" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="patrimonio" name="Patrimônio" stroke={T.primary} strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
