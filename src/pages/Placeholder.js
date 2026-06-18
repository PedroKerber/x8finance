import { T } from '../theme'
import { Card } from '../components/ui'

const PAGE_INFO = {
  relatorios: { icon: '📊', title: 'Relatórios', desc: 'Relatórios completos com filtros avançados, exportação em PDF, Excel e CSV.' },
  empresas: { icon: '🏢', title: 'Empresas', desc: 'Gerencie todas as empresas do grupo, usuários e permissões.' },
  categorias: { icon: '🏷', title: 'Categorias', desc: 'Configure categorias personalizadas para receitas e despesas.' },
  centro_custo: { icon: '⚙', title: 'Centro de Custo', desc: 'Organize e analise seus gastos por centro de custo.' },
  fornecedores: { icon: '🤝', title: 'Fornecedores', desc: 'Cadastre e gerencie seus fornecedores.' },
  clientes: { icon: '👥', title: 'Clientes', desc: 'Base de clientes com histórico de transações.' },
  metas: { icon: '🎯', title: 'Metas Financeiras', desc: 'Defina e acompanhe metas financeiras mensais e anuais.' },
  configuracoes: { icon: '⚙', title: 'Configurações', desc: 'Configurações da conta, integrações e preferências.' },
  scanner: { icon: '📷', title: 'Scanner Inteligente Norvo', desc: 'Escanear nota fiscal com IA para lançamento automático.' },
}

export default function Placeholder({ page }) {
  const info = PAGE_INFO[page] || { icon: '🔧', title: page, desc: 'Em desenvolvimento.' }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: T.text }}>
      <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>{info.title}</h1>
      <div style={{ color: T.sub, fontSize: 14, marginBottom: 32 }}>{info.desc}</div>

      <Card style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>{info.icon}</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Em desenvolvimento</div>
        <div style={{ color: T.sub, fontSize: 14, maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.7 }}>
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve. Fique ligado nas atualizações!
        </div>
        <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Em breve', 'Versão 2.0'].map(tag => (
            <span key={tag} style={{ background: T.primaryLight, color: T.primary, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}
