const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { email, nome } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email obrigatório' })

  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Ensure email is confirmed so recovery link works immediately.
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const existing = listData?.users?.find(u => u.email === email)
  if (existing && !existing.email_confirmed_at) {
    await supabaseAdmin.auth.admin.updateUserById(existing.id, { email_confirm: true })
  }

  // Recovery link works for any confirmed user without OTP expiry issues.
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      data: { nome: nome || email },
      redirectTo: 'https://norvoapp.com.br/ativar-conta',
    },
  })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({
    success:    true,
    inviteLink: data.properties?.action_link || null,
  })
}
