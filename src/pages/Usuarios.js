import { useState } from 'react'
import { T } from '../theme'
import { Card, Btn, Input, Modal } from '../components/ui'
import { EMPRESAS } from '../data'

const PERFIS = [
  { id: 'master', nome: 'Master', icon: '👑', cor: '#7c3aed', bg: '#7c3aed18', desc: 'Acesso total ao sistema. Pode gerenciar empresas, usuários, configurações e todas as funcionalidades.', nivel: 'Acesso total' },
  { id: 'admin', nome: 'Administrador', icon: '🛡', cor: '#2563eb', bg: '#2563eb18', desc: 'Pode gerenciar operações financeiras, usuários (exceto Masters) e relatórios. Acesso a todas as empresas.', nivel: 'Alto acesso' },
  { id: 'gerente', nome: 'Gerente Financeiro', icon: '📊', cor: '#16a34a', bg: '#16a34a18', desc: 'Pode gerenciar receitas, despesas, fluxo de caixa e relatórios financeiros.', nivel: 'Acesso médio' },
  { id: 'contador', nome: 'Contador', icon: '🧾', cor: '#ea580c', bg: '#ea580c18', desc: 'Pode visualizar e gerar relatórios contábeis, exportar dados e acompanhar movimentações.', nivel: 'Acesso restrito' },
]

const NIVEL_COR = { 'Acesso total': T.purple, 'Alto acesso': T.blue, 'Acesso médio': T.green, 'Acesso restrito': T.orange }

const EMPTY = { nome: '', email: '', empresaId: 'kz', perfil: 'gerente', ativo: true }

const initials = (nome) => nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
const CORES_AVATAR = ['#16a34a', '#2563eb', '#7c3aed', '#ea580c', '#dc2626', '#0891b2', '#ca8a04']
const avatarCor = (nome) => CORES_AVATAR[nome.charCodeAt(0) % CORES_AVATAR.length]

export default function Usuarios({ usuario }) {
  const [usuarios, setUsuarios] = useState([
    { id: '1', nome: usuario?.nome || 'Pedro Kerber', email: usuario?.email || 'pedrork22@icloud.com', empresaId: 'kz', perfil: 'master', ativo: true, ultimoAcesso: 'Hoje, agora' },
  ])
  const [search, setSearch] = useState('')
  const [filtroEmp, setFiltroEmp] = useState('Todas')
  const [filtroPerfil, setFiltroPerfil] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [isEdit, setIsEdit] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const filtered = usuarios.filter(u => {
    const matchSearch = !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchEmp = filtroEmp === 'Todas' || u.empresaId === filtroEmp
    const matchPerfil = filtroPerfil === 'Todos' || u.perfil === filtroPerfil
    return matchSearch && matchEmp && matchPerfil
  })

  const masters = usuarios.filter(u => u.perfil === 'master').length
  const admins = usuarios.filter(u => u.perfil === 'admin').length
  const outros = usuarios.filter(u => u.perfil !== 'master' && u.perfil !== 'admin').length

  const perfilInfo = (id) => PERFIS.find(p => p.id === id) || PERFIS[2]
  const empNome = (id) => EMPRESAS.find(e => e.id === id)?.nome || id

  const openAdd = () => { setForm(EMPTY); setIsEdit(false); setModal(true) }
  const openEdit = u => { setForm({ ...u }); setIsEdit(true); setModal(true) }

  const handleSave = () => {
    if (!form.nome.trim() || !form.email.trim()) return
    if (isEdit) {
      setUsuarios(prev => prev.map(u => u.id === form.id ? form : u))
    } else {
      setUsuarios(prev => [...prev, { ...form, id: Date.now().toString(), ultimoAcesso: '—' }])
    }
    setModal(false)
  }

  const handleDelete = (id) => { setUsuarios(prev => prev.filter(u => u.id !== id)); setConfirm(null) }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: T.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>Usuários</h1>
          <div style={{ color: T.sub, fontSize: 14 }}>Gerencie os usuários do sistema, permissões e níveis de acesso.</div>
        </div>
        <Btn onClick={openAdd} icon="＋">Novo Usuário</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '👥', bg: T.blueL, label: 'Total de Usuários', value: usuarios.length, sub: `Ativos: ${usuarios.filter(u => u.ativo).length}` },
          { icon: '👑', bg: '#7c3aed18', label: 'Master', value: masters, sub: `${Math.round(masters / Math.max(usuarios.length, 1) * 100)}% do total` },
          { icon: '🛡', bg: T.blueL, label: 'Administradores', value: admins, sub: `${Math.round(admins / Math.max(usuarios.length, 1) * 100)}% do total` },
          { icon: '👤', bg: T.orangeL || T.yellowL, label: 'Outros Perfis', value: outros, sub: `${Math.round(outros / Math.max(usuarios.length, 1) * 100)}% do total` },
        ].map(k => (
          <Card key={k.label} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: k.bg, borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{k.icon}</div>
              <div>
                <div style={{ color: T.sub, fontSize: 11 }}>{k.label}</div>
                <div style={{ fontWeight: 800, fontSize: 24 }}>{k.value}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>{k.sub}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário por nome, e-mail ou empresa..."
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1.5px solid ${T.border}`, borderRadius: 8, background: T.white, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <select value={filtroEmp} onChange={e => setFiltroEmp(e.target.value)}
            style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
            <option value="Todas">Todas as empresas</option>
            {EMPRESAS.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <select value={filtroPerfil} onChange={e => setFiltroPerfil(e.target.value)}
            style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
            <option value="Todos">Todos os perfis</option>
            {PERFIS.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </Card>

      {/* Tabela */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {['Usuário', 'Empresa', 'Perfil', 'Status', 'Último acesso', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: T.sub, fontWeight: 600, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const p = perfilInfo(u.perfil)
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarCor(u.nome), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {initials(u.nome)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.nome}</div>
                          <div style={{ color: T.muted, fontSize: 11 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.sub }}>{empNome(u.empresaId)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: p.bg, color: p.cor, fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '3px 10px' }}>{p.nome}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: u.ativo ? T.green : T.muted, fontWeight: 600 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.ativo ? T.green : T.muted, display: 'inline-block' }} />
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.sub }}>{u.ultimoAcesso}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(u)} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                        {u.id !== '1' && (
                          <button onClick={() => setConfirm(u.id)} style={{ background: 'none', border: `1px solid ${T.redL}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer', color: T.red, fontSize: 14 }}>🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', color: T.muted, fontSize: 12 }}>
          Mostrando {filtered.length} de {usuarios.length} usuários
        </div>
      </Card>

      {/* Perfis e Permissões */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Perfis e Permissões</div>
          <div style={{ color: T.sub, fontSize: 13, marginBottom: 20 }}>Entenda as permissões de cada perfil do sistema.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PERFIS.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', border: `1px solid ${T.border}`, borderRadius: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.nome}</span>
                    <span style={{ background: NIVEL_COR[p.nivel] + '18', color: NIVEL_COR[p.nivel], fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 10px' }}>{p.nivel}</span>
                  </div>
                  <div style={{ color: T.sub, fontSize: 12, lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, textAlign: 'center' }}>Segurança em primeiro lugar</div>
          <div style={{ color: T.sub, fontSize: 13, marginBottom: 18, textAlign: 'center', lineHeight: 1.5 }}>Todos os acessos são registrados e monitorados para garantir a segurança dos seus dados financeiros.</div>
          {['Log de auditoria completo', 'Controle de permissões detalhado', 'Sessões seguras e criptografadas', 'Conformidade com a LGPD'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: T.sub }}>
              <span style={{ color: T.green, fontWeight: 700 }}>✓</span> {item}
            </div>
          ))}
        </Card>
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={isEdit ? 'Editar Usuário' : 'Novo Usuário'} onClose={() => setModal(false)}
          footer={<><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={handleSave}>{isEdit ? 'Salvar' : 'Criar Usuário'}</Btn></>}>
          <Input label="Nome completo" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="João Silva" />
          <Input label="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@empresa.com.br" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5 }}>Empresa</label>
            <select value={form.empresaId} onChange={e => setForm(f => ({ ...f, empresaId: e.target.value }))}
              style={{ width: '100%', background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '9px 12px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}>
              {EMPRESAS.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5 }}>Perfil</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PERFIS.map(p => (
                <div key={p.id} onClick={() => setForm(f => ({ ...f, perfil: p.id }))}
                  style={{ border: `2px solid ${form.perfil === p.id ? p.cor : T.border}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: form.perfil === p.id ? p.bg : T.white, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: form.perfil === p.id ? 700 : 400, color: form.perfil === p.id ? p.cor : T.sub }}>
                  <span>{p.icon}</span>{p.nome}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <Modal title="Remover usuário" onClose={() => setConfirm(null)}
          footer={<><Btn variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Btn><Btn variant="danger" onClick={() => handleDelete(confirm)}>Remover</Btn></>}>
          <p style={{ color: T.sub }}>Tem certeza que deseja remover este usuário do sistema?</p>
        </Modal>
      )}
    </div>
  )
}
