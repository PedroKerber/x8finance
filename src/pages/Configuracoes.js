import { useState } from 'react'
import { T } from '../theme'
import { Card, Btn, Input } from '../components/ui'
import { EMPRESAS } from '../data'

const CARGOS = ['CEO / Administrador Master', 'Proprietário', 'Diretor', 'Gerente Financeiro', 'Contador', 'Analista', 'Assistente']

const PERMISSOES = [
  'Dashboard', 'Empresas', 'Receitas', 'Despesas',
  'Metas Financeiras', 'Relatórios', 'Categorias',
  'Centro de Custos', 'Usuários', 'Configurações', 'Logs do Sistema',
]

const ATIVIDADES = [
  { cor: T.green, bg: T.greenL, icon: '＋', titulo: 'Cadastro de despesa', desc: 'Despesa de material de escritório', data: 'Hoje', hora: '14:12' },
  { cor: T.blue, bg: T.blueL, icon: '↑', titulo: 'Aprovação de receita', desc: 'Receita de aluguel - Sala 101', data: 'Hoje', hora: '11:43' },
  { cor: T.purple, bg: T.purpleL, icon: '≡', titulo: 'Geração de relatório financeiro', desc: 'Relatório Mensal - Mai/2026', data: 'Ontem', hora: '17:58' },
  { cor: T.orange, bg: T.orangeL, icon: '👤', titulo: 'Cadastro de usuário', desc: 'Novo usuário: Ana Beatriz', data: 'Ontem', hora: '16:22' },
]

const SectionTitle = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: T.primary }}>{icon}</div>
    <span style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{title}</span>
  </div>
)

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${T.borderLight}` }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{value || '—'}</div>
    </div>
  </div>
)

export default function Configuracoes({ usuario, onLogout, empresa }) {
  const saved = JSON.parse(localStorage.getItem('x8_perfil') || '{}')
  const [nome, setNome] = useState(saved.nome || 'Pedro Felipe Ramos Kerber')
  const [cargo, setCargo] = useState(saved.cargo || 'CEO / Administrador Master')
  const [telefone, setTelefone] = useState(saved.telefone || '(61) 99999-9999')
  const [cpf, setCpf] = useState(saved.cpf || '•••.•••.•••-••')
  const [editMode, setEditMode] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const salvar = () => {
    localStorage.setItem('x8_perfil', JSON.stringify({ nome, cargo, telefone, cpf }))
    setEditMode(false)
    showToast('Perfil atualizado com sucesso!')
  }

  const email = usuario?.email || 'pedro@x8finance.com'
  const inicial = (nome || 'P')[0].toUpperCase()
  const empAtual = empresa?.nome || 'Kazole Imobiliária'

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: T.text, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>Meu Perfil</h1>
        <div style={{ color: T.sub, fontSize: 14 }}>Gerencie suas informações pessoais e permissões de acesso.</div>
      </div>

      {/* Card principal */}
      <Card style={{ padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.primary}, #0d5c2e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 38,
              boxShadow: `0 6px 20px ${T.primary}44`,
            }}>{inicial}</div>
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 26, height: 26, borderRadius: '50%',
              background: T.primary, border: '3px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, cursor: 'pointer', color: '#fff',
            }}>📷</div>
          </div>

          {/* Info central */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>{nome}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ background: T.purpleL, color: T.purple, fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                👑 Master Administrator
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.green, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                Ativo
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.sub, fontSize: 13 }}>
              <span>🏢</span>
              <span>Empresa atual: <strong style={{ color: T.text }}>{empAtual}</strong></span>
            </div>
          </div>

          {/* Meta info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
            {[
              { icon: '🕐', label: 'Último acesso', val: '16/06/2026 · 14:37' },
              { icon: '📅', label: 'Data de cadastro', val: '10/06/2026' },
              { icon: '✉', label: 'E-mail', val: email },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{icon}</span>
                <div>
                  <div style={{ color: T.muted, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <Btn onClick={() => setEditMode(e => !e)}>
              {editMode ? '✓ Modo edição ativo' : '✏ Editar Perfil'}
            </Btn>
            <Btn variant="ghost" sm>🔒 Alterar Senha</Btn>
          </div>
        </div>
      </Card>

      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Informações Pessoais */}
        <Card style={{ padding: '24px 28px' }}>
          <SectionTitle icon="👤" title="Informações Pessoais" />
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} />
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5 }}>Cargo</label>
                <select value={cargo} onChange={e => setCargo(e.target.value)} style={{ width: '100%', background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '9px 12px', color: T.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                  {CARGOS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(61) 99999-9999" />
              <Input label="CPF" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
          ) : (
            <div>
              <InfoRow icon="👤" label="Nome Completo" value={nome} />
              <InfoRow icon="✉" label="E-mail" value={email} />
              <InfoRow icon="📱" label="Telefone" value={telefone} />
              <InfoRow icon="💼" label="Cargo" value={cargo} />
              <InfoRow icon="🪪" label="CPF" value={cpf} />
              <InfoRow icon="📅" label="Data de Cadastro" value="10/06/2026" />
            </div>
          )}
        </Card>

        {/* Permissões */}
        <Card style={{ padding: '24px 28px' }}>
          <SectionTitle icon="🛡" title="Permissões de Acesso" />
          <div style={{ background: `linear-gradient(135deg, ${T.purpleL}, #f3e8ff)`, borderRadius: 12, padding: '14px 18px', marginBottom: 18, border: `1px solid ${T.purple}22` }}>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Nível de Acesso</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.purple, marginBottom: 2 }}>MASTER</div>
            <div style={{ color: T.sub, fontSize: 12 }}>Possui acesso total ao sistema.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', marginBottom: 18 }}>
            {PERMISSOES.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <span style={{ color: T.green, fontWeight: 700 }}>✓</span>
                <span style={{ color: T.text }}>{p}</span>
              </div>
            ))}
          </div>
          <button style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            Gerenciar permissões avançadas →
          </button>
        </Card>
      </div>

      {/* Grid secundário */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Empresas Vinculadas */}
        <Card style={{ padding: '24px 28px' }}>
          <SectionTitle icon="🏢" title="Empresas Vinculadas" />
          <div style={{ color: T.sub, fontSize: 12, marginTop: -12, marginBottom: 16 }}>Empresas que você gerencia no sistema.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {EMPRESAS.map((emp, i) => (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: emp.cor + '22', border: `1.5px solid ${emp.cor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: emp.cor, fontSize: 11, flexShrink: 0 }}>
                  {emp.initials}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: T.text }}>{emp.nome}</span>
                {i === 0 && <span style={{ background: T.yellowL, color: T.yellow, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 8px' }}>⭐ Principal</span>}
              </div>
            ))}
          </div>
          <button style={{ width: '100%', border: `1.5px dashed ${T.border}`, borderRadius: 10, padding: '10px', background: 'transparent', color: T.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Vincular Empresa
          </button>
        </Card>

        {/* Segurança */}
        <Card style={{ padding: '24px 28px' }}>
          <SectionTitle icon="🔒" title="Segurança da Conta" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: '🛡', label: 'Senha alterada há', val: '23 dias', ok: true },
              { icon: '✅', label: 'Autenticação em 2 fatores', val: 'Ativada', ok: true },
              { icon: '💻', label: 'Sessões ativas', val: '2 dispositivos', ok: true },
            ].map(({ icon, label, val, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: ok ? T.greenL : T.redL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 12, color: ok ? T.green : T.red }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <Btn variant="ghost" sm full>🔒 Alterar Senha</Btn>
            <Btn variant="ghost" sm full>💻 Gerenciar Dispositivos</Btn>
          </div>
        </Card>
      </div>

      {/* Histórico de Atividades */}
      <Card style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: T.primary }}>🕐</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Histórico de Atividades</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Ver todas →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ATIVIDADES.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < ATIVIDADES.length - 1 ? `1px solid ${T.borderLight}` : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: a.cor, fontWeight: 700, flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{a.titulo}</div>
                <div style={{ color: T.sub, fontSize: 12 }}>{a.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{a.data}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>{a.hora}</div>
              </div>
            </div>
          ))}
        </div>
        <button style={{ width: '100%', marginTop: 16, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px', background: 'transparent', color: T.sub, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Ver histórico completo
        </button>
      </Card>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {!confirmLogout ? (
          <Btn variant="ghost" onClick={() => setConfirmLogout(true)}>↩ Sair do Sistema</Btn>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: T.sub }}>Tem certeza?</span>
            <Btn variant="danger" sm onClick={onLogout}>Sim, sair</Btn>
            <Btn variant="ghost" sm onClick={() => setConfirmLogout(false)}>Cancelar</Btn>
          </div>
        )}
        <Btn onClick={salvar} style={{ minWidth: 160 }}>💾 Salvar Alterações</Btn>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: T.sidebar, color: '#fff', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: T.shadowMd, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: T.primary }}>✓</span> {toast}
        </div>
      )}
    </div>
  )
}
