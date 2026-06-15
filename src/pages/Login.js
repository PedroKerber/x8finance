import { useState } from 'react'
import { T } from '../theme'
import { Btn, Input } from '../components/ui'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@x8.com')
  const [senha, setSenha] = useState('x8@2024')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const go = () => {
    if (!email.trim() || !senha.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin({ nome: 'Pedro', email }) }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.sidebar, display: 'flex', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#fff' }}>
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: -1, marginBottom: 16 }}>
            <span style={{ color: T.primary }}>X8</span> FINANCE
          </div>
          <div style={{ fontSize: 18, opacity: 0.8, marginBottom: 32, lineHeight: 1.6 }}>
            Gestão financeira inteligente para múltiplas empresas.
          </div>
          {[
            ['⚡', 'Dashboard em tempo real com insights de IA'],
            ['📊', 'Controle multiempresa com relatórios completos'],
            ['🔒', 'Fechamento mensal e conciliação bancária'],
            ['📷', 'Scanner inteligente de notas fiscais'],
          ].map(([ic, txt]) => (
            <div key={txt} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ background: T.primary + '22', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ic}</div>
              <span style={{ opacity: 0.85, fontSize: 14 }}>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 440, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.5, marginBottom: 6 }}>
            <span style={{ color: T.primary }}>X8</span> Finance
          </div>
          <div style={{ color: T.sub, fontSize: 14, marginBottom: 32 }}>Acesse sua conta para continuar</div>

          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input type={show ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                style={{ width: '100%', background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '9px 40px 9px 12px', color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.muted }}>{show ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.sub, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: T.primary }} /> Manter conectado
            </label>
            <span style={{ color: T.primary, cursor: 'pointer', fontWeight: 600 }}>Esqueci a senha</span>
          </div>

          <Btn full onClick={go} disabled={loading} style={{ padding: '13px', fontSize: 15, borderRadius: 10, marginBottom: 10 }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </Btn>
          <Btn full variant="outline" style={{ padding: '12px', fontSize: 14, borderRadius: 10 }}>Criar conta grátis</Btn>

          <div style={{ textAlign: 'center', marginTop: 24, color: T.muted, fontSize: 12 }}>
            Ao entrar, você concorda com os <span style={{ color: T.primary }}>Termos de Uso</span>
          </div>
        </div>
      </div>
    </div>
  )
}
