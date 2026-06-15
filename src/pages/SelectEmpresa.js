import { useState } from 'react'
import { T, fmt } from '../theme'
import { EMPRESAS } from '../data'
import { Card } from '../components/ui'

export default function SelectEmpresa({ usuario, onSelect, data }) {
  const [q, setQ] = useState('')
  const filtered = EMPRESAS.filter(e => e.nome.toLowerCase().includes(q.toLowerCase()))

  const getStats = (emp) => {
    const lancs = data[emp.id]?.lancamentos || []
    const rec = lancs.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const desp = lancs.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)
    return { rec, desp, saldo: rec - desp }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.sidebar, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: T.sidebar, padding: '20px 32px', borderBottom: `1px solid ${T.sidebarActive}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>
          <span style={{ color: T.primary }}>X8</span> FINANCE
        </div>
        <div style={{ color: T.sidebarText, fontSize: 14 }}>
          Olá, <strong style={{ color: '#fff' }}>{usuario?.nome}</strong> 👋
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, color: '#fff' }}>
          <h1 style={{ fontWeight: 800, fontSize: 28, margin: '0 0 8px' }}>Selecionar empresa</h1>
          <p style={{ color: T.sidebarText, fontSize: 15, margin: 0 }}>Escolha a empresa que deseja gerenciar</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.sidebarText, fontSize: 16 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar empresa..."
            style={{ width: '100%', background: T.sidebarActive, border: `1px solid ${T.sidebarActive}`, borderRadius: 10, padding: '12px 14px 12px 44px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((emp, i) => {
            const stats = getStats(emp)
            return (
              <Card key={emp.id} onClick={() => onSelect(emp)} style={{ padding: 20, border: i === 0 ? `1.5px solid ${emp.cor}55` : `1px solid ${T.border}`, cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadowMd }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = T.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: emp.cor + '18', border: `1.5px solid ${emp.cor}44`, borderRadius: 10, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: emp.cor, fontSize: 16, flexShrink: 0 }}>
                    {emp.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.nome}</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>{emp.setor} · {emp.cnpj}</div>
                  </div>
                  {i === 0 && <span style={{ background: T.primaryLight, color: T.primary, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Principal</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  {[['Saldo', emp.cor, stats.saldo], ['Receitas', T.green, stats.rec], ['Despesas', T.red, stats.desp]].map(([l, c, v], j) => (
                    <div key={l} style={{ borderLeft: j > 0 ? `1px solid ${T.border}` : 'none', paddingLeft: j > 0 ? 10 : 0 }}>
                      <div style={{ color: T.muted, fontSize: 10, marginBottom: 2 }}>{l}</div>
                      <div style={{ color: c, fontWeight: 700, fontSize: 12 }}>
                        {v >= 1e6 ? 'R$ ' + (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? 'R$ ' + (v / 1e3).toFixed(0) + 'k' : fmt(v)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
