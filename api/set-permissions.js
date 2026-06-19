const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { ownerUserId, collaboratorUserId, empresaIds, role } = req.body || {}
  if (!ownerUserId || !collaboratorUserId) {
    return res.status(400).json({ error: 'ownerUserId e collaboratorUserId são obrigatórios' })
  }

  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: delError } = await supabaseAdmin
    .from('user_empresa_access')
    .delete()
    .eq('owner_user_id', ownerUserId)
    .eq('collaborator_user_id', collaboratorUserId)

  if (delError) return res.status(400).json({ error: delError.message })

  if (empresaIds && empresaIds.length > 0) {
    const rows = empresaIds.map(empresa_id => ({
      owner_user_id: ownerUserId,
      collaborator_user_id: collaboratorUserId,
      empresa_id,
      role: role || 'viewer',
    }))
    const { error: insError } = await supabaseAdmin
      .from('user_empresa_access')
      .insert(rows)
    if (insError) return res.status(400).json({ error: insError.message })
  }

  return res.status(200).json({ success: true })
}
