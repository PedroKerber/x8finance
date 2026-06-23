const { applyCors, adminClient, requireMaster } = require('./_auth')

module.exports = async (req, res) => {
  applyCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const supabaseAdmin = adminClient()
  const caller = await requireMaster(req, res, supabaseAdmin)
  if (!caller) return

  const { userId, nome, cargo, perfil, telefone, foto, status, mustChangePassword } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' })

  // user_metadata é MESCLADO (merge) pelo updateUserById — enviamos só os campos presentes,
  // movendo telefone/foto/status/mustChangePassword do localStorage para o Supabase (Etapa 3).
  // Obs.: perfil aqui é rótulo de exibição; a autorização real é is_master + role por empresa.
  const meta = {}
  if (nome     !== undefined) meta.nome     = nome
  if (cargo    !== undefined) meta.cargo    = cargo
  if (perfil   !== undefined) meta.perfil   = perfil
  if (telefone !== undefined) meta.telefone = telefone
  if (foto     !== undefined && foto !== '') meta.foto = foto   // não apaga foto existente com vazio
  if (status   !== undefined) meta.status   = status
  if (mustChangePassword !== undefined) meta.mustChangePassword = !!mustChangePassword

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: meta })
  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ success: true })
}
