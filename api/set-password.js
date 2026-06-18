const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { userId, password } = req.body || {}
  if (!userId || !password) return res.status(400).json({ error: 'userId e password obrigatórios' })
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' })

  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Confirma o email E define a senha num único update
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })

  if (error) return res.status(400).json({ error: error.message })
  return res.status(200).json({ success: true })
}
