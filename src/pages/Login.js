import { useState } from 'react'
import { T } from '../theme'
import { Btn } from '../components/ui'

const LogoN = ({ size, light }) => (
  <svg width={size} height={Math.round(size * 70 / 60)} viewBox="0 0 60 70" fill="none" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="14" height="70" fill={light ? '#ffffff' : '#0D2545'} rx="1.5" />
    <polygon points="14,0 32,0 46,70 28,70" fill="#F47B20" />
    <rect x="46" y="0" width="14" height="70" fill={light ? '#ffffff' : '#0D2545'} rx="1.5" />
  </svg>
)

const inp = (focus, err) => ({
  width: '100%', background: '#ffffff',
  border: `1.5px solid ${err ? T.red : focus ? '#0D2545' : '#C9D3DD'}`,
  borderRadius: 8, padding: '10px 12px', color: '#111827',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color .15s',
})

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [fEmail, setFEmail] = useState(false)
  const [fSenha, setFSenha] = useState(false)

  const go = async () => {
    if (!email.trim() || !senha.trim()) return
    setLoading(true)
    setErro('')
    try {
      await onLogin(email.trim(), senha)
    } catch (e) {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.sidebar, display: 'flex', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Left panel */}
      <div className="login-left">
        <div style={{ maxWidth: 460 }}>

          {/* Logo mark + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <LogoN size={52} light />
            <div>
              <div style={{ fontWeight: 900, fontSize: 32, letterSpacing: -0.5, color: '#ffffff', lineHeight: 1.05 }}>
                NORVO
              </div>
              <div style={{ fontSize: 10, color: T.primary, letterSpacing: 2.5, marginTop: 4, fontWeight: 700 }}>
                GESTÃO FINANCEIRA
              </div>
            </div>
          </div>

          <div style={{ fontSize: 17, opacity: 0.75, marginBottom: 36, lineHeight: 1.65 }}>
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
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Logo on right panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <LogoN size={30} />
            <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -0.5, color: '#0D2545' }}>Norvo</div>
          </div>

          <div style={{ color: T.sub, fontSize: 14, marginBottom: 28 }}>Acesse sua conta para continuar</div>

          {/* E-mail */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>E-mail</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)}
              placeholder="seu@email.com"
              style={inp(fEmail, false)}
            />
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                onFocus={() => setFSenha(true)} onBlur={() => setFSenha(false)}
                style={{ ...inp(fSenha, !!erro), paddingRight: 42 }}
              />
              <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF' }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
            {erro && <div style={{ color: T.red, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{erro}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.sub, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: T.primary }} /> Manter conectado
            </label>
          </div>

          <Btn full onClick={go} disabled={loading} style={{ padding: '13px', fontSize: 15, borderRadius: 10, marginBottom: 10 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Btn>

          <div style={{ textAlign: 'center', marginTop: 24, color: T.muted, fontSize: 12 }}>
            Ao entrar, você concorda com os <span style={{ color: T.primary, cursor: 'pointer' }}>Termos de Uso</span>
          </div>
        </div>
      </div>
    </div>
  )
}
