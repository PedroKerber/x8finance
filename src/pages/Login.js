import { useState } from 'react'
import { T } from '../theme'

const LogoN = ({ size }) => (
  <svg width={size} height={Math.round(size * 70 / 60)} viewBox="0 0 60 70" fill="none" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="14" height="70" fill="#0D2545" rx="1.5" />
    <polygon points="14,0 32,0 46,70 28,70" fill="#F47B20" />
    <rect x="46" y="0" width="14" height="70" fill="#0D2545" rx="1.5" />
  </svg>
)

const IcoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IcoEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

const IcoShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IcoLogin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
)

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [fEmail, setFEmail] = useState(false)
  const [fSenha, setFSenha] = useState(false)
  const [lembrar, setLembrar] = useState(true)

  const go = async () => {
    if (!email.trim() || !senha.trim()) return
    setLoading(true)
    setErro('')
    try {
      await onLogin(email.trim(), senha)
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F7', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Dot pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <pattern id="login-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#0D2545" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dots)" />
      </svg>

      {/* Top-right navy triangle */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 340, height: 280, background: '#0D2545', clipPath: 'polygon(100% 0, 20% 0, 100% 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 130, background: T.primary, opacity: 0.22, clipPath: 'polygon(100% 0, 55% 0, 100% 100%)', pointerEvents: 'none' }} />

      {/* Bottom-left orange triangle */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 280, height: 240, background: T.primary, clipPath: 'polygon(0 0, 0 100%, 100% 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 130, height: 110, background: '#0D2545', opacity: 0.18, clipPath: 'polygon(0 0, 0 100%, 100% 100%)', pointerEvents: 'none' }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#ffffff', borderRadius: 20, border: '0.5px solid rgba(0,0,0,0.06)', padding: '38px 40px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
              <LogoN size={28} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.3, color: '#0D2545', lineHeight: 1 }}>NORVO</div>
                <div style={{ fontSize: 8, letterSpacing: 2, color: T.primary, fontWeight: 700, marginTop: 3 }}>GESTÃO FINANCEIRA INTELIGENTE</div>
              </div>
            </div>
            <div style={{ fontStyle: 'italic', color: '#6B7280', fontSize: 13 }}>
              O novo <span style={{ color: T.primary, fontWeight: 600, fontStyle: 'normal' }}>norte</span> do seu negócio.
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 0.5, background: '#E5E7EB', margin: '0 0 22px' }} />

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Entrar no sistema</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Acesse sua conta para continuar</div>
          </div>

          {/* E-mail */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>E-mail</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${fEmail ? '#0D2545' : '#D1D5DB'}`, borderRadius: 10, padding: '0 14px', height: 48, background: fEmail ? '#fff' : '#FAFAFA', transition: 'border-color .15s, background .15s', gap: 10 }}>
              <IcoMail />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFEmail(true)}
                onBlur={() => setFEmail(false)}
                placeholder="seu@email.com"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${erro ? T.red : fSenha ? '#0D2545' : '#D1D5DB'}`, borderRadius: 10, padding: '0 14px', height: 48, background: '#fff', transition: 'border-color .15s', gap: 10 }}>
              <IcoLock />
              <input
                type={show ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                onFocus={() => setFSenha(true)}
                onBlur={() => setFSenha(false)}
                placeholder="••••••••••"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
              />
              <button
                onClick={() => setShow(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0 }}
              >
                {show ? <IcoEyeOff /> : <IcoEye />}
              </button>
            </div>
            {erro && <div style={{ color: T.red, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{erro}</div>}
          </div>

          {/* Esqueci senha */}
          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: '#0D2545', fontWeight: 600, cursor: 'pointer' }}>Esqueci minha senha</span>
          </div>

          {/* Manter conectado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
            <div
              onClick={() => setLembrar(l => !l)}
              role="checkbox"
              aria-checked={lembrar}
              tabIndex={0}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setLembrar(l => !l)}
              style={{ width: 17, height: 17, borderRadius: 4, background: lembrar ? '#0D2545' : 'transparent', border: `1.5px solid ${lembrar ? '#0D2545' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background .15s, border-color .15s' }}
            >
              {lembrar && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span onClick={() => setLembrar(l => !l)} style={{ fontSize: 13, color: '#6B7280', cursor: 'pointer', userSelect: 'none' }}>Manter conectado</span>
          </div>

          {/* Botão Entrar */}
          <button
            onClick={go}
            disabled={loading}
            style={{ width: '100%', height: 50, background: loading ? '#0D254580' : '#0D2545', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, transition: 'background .15s' }}
          >
            {!loading && <IcoLogin />}
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: 0.4 }}>{loading ? 'Entrando...' : 'Entrar'}</span>
          </button>

          {/* Segurança */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IcoShield />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Ambiente seguro e criptografado</span>
          </div>

        </div>
      </div>

      {/* Page footer */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 16px 18px', fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>
        © NORVO — Gestão Financeira Inteligente
      </div>

    </div>
  )
}
