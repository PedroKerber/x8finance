const { applyCors, adminClient, requireMaster } = require('./_auth')

module.exports = async (req, res) => {
  applyCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const supabaseAdmin = adminClient()
  const caller = await requireMaster(req, res, supabaseAdmin)
  if (!caller) return

  // Identidade do "dono" vem do TOKEN, nunca do body (anti-escalonamento).
  const ownerUserId = caller.id
  const body = req.body || {}
  const { collaboratorUserId } = body
  if (!collaboratorUserId) {
    return res.status(400).json({ error: 'collaboratorUserId é obrigatório' })
  }
  if (collaboratorUserId === ownerUserId) {
    return res.status(400).json({ error: 'Não é possível vincular o próprio usuário' })
  }

  // Perfil POR empresa: aceita vinculos [{empresa_id, role}] (preferido) ou empresaIds+role (legado)
  let vinculos = []
  if (Array.isArray(body.vinculos)) {
    vinculos = body.vinculos
      .filter(v => v && v.empresa_id)
      .map(v => ({ empresa_id: v.empresa_id, role: v.role || 'gerente' }))
  } else if (Array.isArray(body.empresaIds)) {
    vinculos = body.empresaIds.map(id => ({ empresa_id: id, role: body.role || 'gerente' }))
  }

  // Valida que TODAS as empresas pertencem ao caller (não vincula empresa de terceiros).
  if (vinculos.length > 0) {
    const { data: owned, error: ownErr } = await supabaseAdmin
      .from('empresas').select('id').eq('owner_user_id', ownerUserId)
    if (ownErr) return res.status(400).json({ error: ownErr.message })
    const ownedSet = new Set((owned || []).map(e => e.id))
    if (vinculos.some(v => !ownedSet.has(v.empresa_id))) {
      return res.status(403).json({ error: 'Alguma empresa não pertence ao usuário autenticado' })
    }
  }

  // Estratégia "replace": apaga os vínculos atuais e insere o novo conjunto.
  const { error: delError } = await supabaseAdmin
    .from('user_empresa_access')
    .delete()
    .eq('owner_user_id', ownerUserId)
    .eq('collaborator_user_id', collaboratorUserId)
  if (delError) return res.status(400).json({ error: delError.message })

  if (vinculos.length > 0) {
    const rows = vinculos.map(v => ({
      owner_user_id: ownerUserId,
      collaborator_user_id: collaboratorUserId,
      empresa_id: v.empresa_id,
      role: v.role || 'gerente',
    }))
    const { error: insError } = await supabaseAdmin
      .from('user_empresa_access')
      .insert(rows)
    if (insError) return res.status(400).json({ error: insError.message })
  }

  return res.status(200).json({ success: true })
}
