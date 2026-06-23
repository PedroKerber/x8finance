const { applyCors, adminClient, requireMaster } = require('./_auth')

module.exports = async (req, res) => {
  applyCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const supabaseAdmin = adminClient()
  const caller = await requireMaster(req, res, supabaseAdmin)
  if (!caller) return

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) return res.status(400).json({ error: authError.message })

  // Vínculos por empresa (role = perfil POR empresa) + flag de master (user_roles)
  const { data: perms } = await supabaseAdmin
    .from('user_empresa_access')
    .select('collaborator_user_id, empresa_id, role')
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, is_master')
  const masterSet = new Set((roles || []).filter(r => r.is_master).map(r => r.user_id))

  const users = authData.users.map(u => {
    const meta = u.user_metadata || {}
    const vinculos = (perms || [])
      .filter(p => p.collaborator_user_id === u.id)
      .map(p => ({ empresa_id: p.empresa_id, role: p.role || 'gerente' }))
    return {
      id:                 u.id,
      email:              u.email,
      nome:               meta.nome   || u.email?.split('@')[0] || '',
      perfil:             meta.perfil || null,
      cargo:              meta.cargo  || null,
      telefone:           meta.telefone || '',
      foto:               meta.foto || '',
      status:             meta.status || 'ativo',
      mustChangePassword: !!meta.mustChangePassword,
      isMaster:           masterSet.has(u.id),
      criadoEm:           u.created_at,
      ultimoAcesso:       u.last_sign_in_at,
      emailConfirmado:    !!u.email_confirmed_at,
      vinculos,                              // [{ empresa_id, role }] — perfil por empresa
      empresaIds:         vinculos.map(v => v.empresa_id),
    }
  })

  return res.status(200).json({ users })
}
