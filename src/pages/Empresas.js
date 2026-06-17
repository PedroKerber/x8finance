import { useState, useMemo } from 'react'
import { T } from '../theme'
import { Card, Btn, Input, Modal } from '../components/ui'
import { EMPRESAS } from '../data'

const EMPTY = { nome: '', cnpj: '', setor: '', cor: '#16a34a' }

export default function Empresas({ setPage }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Todas')
  const [ordem, setOrdem] = useState('Nome (A-Z)')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const empresas = useMemo(() => {
    let list = EMPRESAS.map(e => ({ ...e, ativa: true, usuarios: Math.floor(Math.random() * 8) + 3 }))
    if (search) list = list.filter(e => e.nome.toLowerCase().includes(search.toLowerCase()) || e.cnpj.includes(search))
    return list
  }, [search])

  const ativas = empresas.filter(e => e.ativa).length

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: T.text }}>
      {/* Header */}
      <div className="page-hd">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>Empresas</h1>
          <div style={{ color: T.sub, fontSize: 14 }}>Gerencie todas as empresas do grupo, usuários e permissões.</div>
        </div>
        <Btn onClick={() => { setForm(EMPTY); setModal(true) }} icon="＋">Nova Empresa</Btn>
      </div>

      {/* KPIs */}
      <div className="g-4">
        {[
          { icon: '🏢', bg: T.blueL, label: 'Total de Empresas', value: EMPRESAS.length },
          { icon: '✅', bg: T.greenL, label: 'Empresas Ativas', value: ativas },
          { icon: '⏸', bg: T.borderLight, label: 'Empresas Inativas', value: EMPRESAS.length - ativas },
          { icon: '👥', bg: T.purpleL, label: 'Usuários Vinculados', value: 42 },
        ].map(k => (
          <Card key={k.label} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: k.bg, borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{k.icon}</div>
              <div>
                <div style={{ color: T.sub, fontSize: 12 }}>{k.label}</div>
                <div style={{ fontWeight: 800, fontSize: 24 }}>{k.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa por nome ou CNPJ..."
              style={{ width: '100%', paddingLeft: 32, padding: '8px 12px 8px 32px', border: `1.5px solid ${T.border}`, borderRadius: 8, background: T.white, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          {[
            { label: 'Status', value: status, opts: ['Todas', 'Ativa', 'Inativa'], set: setStatus },
            { label: 'Ordenar por', value: ordem, opts: ['Nome (A-Z)', 'Nome (Z-A)', 'Mais recente'], set: setOrdem },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
              style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </Card>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {empresas.map(emp => (
          <Card key={emp.id} style={{ padding: '18px 22px' }}>
            <div className="emp-card-row">
              {/* Logo */}
              <div style={{ width: 60, height: 60, borderRadius: 12, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: emp.cor, fontWeight: 900, fontSize: 16, letterSpacing: -1 }}>{emp.initials}</span>
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{emp.nome}</div>
                <div style={{ color: T.sub, fontSize: 13, marginBottom: 6 }}>{emp.cnpj}</div>
                <span style={{ background: T.greenL, color: T.green, fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>Ativa</span>
              </div>
              {/* Meta */}
              <div className="emp-card-meta">
                <div>
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 2 }}>Usuários</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.usuarios} usuários</div>
                </div>
                <div>
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 2 }}>Plano</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>Premium</div>
                </div>
              </div>
              {/* Ações */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                <button style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>⋮</button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add card */}
        <div onClick={() => { setForm(EMPTY); setModal(true) }}
          style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', margin: '0 auto 10px' }}>+</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.primary, marginBottom: 4 }}>Cadastrar nova empresa</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Clique para adicionar uma nova empresa ao sistema</div>
        </div>
      </div>

      {/* Modal nova empresa */}
      {modal && (
        <Modal title="Nova Empresa" onClose={() => setModal(false)}
          footer={<><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={() => setModal(false)}>Salvar</Btn></>}>
          <Input label="Nome da empresa" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Kazole Imobiliária" />
          <Input label="CNPJ" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
          <Input label="Setor" value={form.setor} onChange={e => setForm(f => ({ ...f, setor: e.target.value }))} placeholder="Imobiliário" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5 }}>Cor da empresa</label>
            <input type="color" value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
              style={{ width: 48, height: 36, border: `1.5px solid ${T.border}`, borderRadius: 6, cursor: 'pointer', padding: 2 }} />
          </div>
        </Modal>
      )}
    </div>
  )
}
