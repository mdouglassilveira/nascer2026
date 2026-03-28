import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Verify caller
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !caller) return res.status(401).json({ error: 'Não autorizado' })

    // Get caller's project
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('project_id, role')
      .eq('id', caller.id)
      .single()

    if (!callerProfile?.project_id) {
      return res.status(400).json({ error: 'Você não tem um projeto' })
    }

    const { name, email, role } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    // Check team size
    const { count: teamSize } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', callerProfile.project_id)

    const { count: pendingSize } = await supabaseAdmin
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', callerProfile.project_id)

    if ((teamSize ?? 0) + (pendingSize ?? 0) >= 5) {
      return res.status(400).json({ error: 'Limite de 5 membros atingido' })
    }

    // Check if user already exists in this project
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id, project_id')
      .eq('email', email)

    if (existingUsers?.length > 0) {
      const existing = existingUsers[0]
      if (existing.project_id === callerProfile.project_id) {
        return res.status(400).json({ error: 'Este membro já faz parte da sua equipe' })
      }
      if (existing.project_id) {
        return res.status(400).json({ error: 'Este email já está vinculado a outro projeto' })
      }
      // Link existing user
      await supabaseAdmin
        .from('users')
        .update({ project_id: callerProfile.project_id, role: 'membro' })
        .eq('id', existing.id)

      return res.json({ success: true, message: 'Membro vinculado ao projeto com sucesso!' })
    }

    // Create new auth user
    const tempPassword = crypto.randomUUID().slice(0, 12) + '!A1'
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (createError) {
      return res.status(400).json({ error: 'Erro ao criar usuário: ' + createError.message })
    }

    // Set project_id
    await supabaseAdmin
      .from('users')
      .update({ project_id: callerProfile.project_id, role: 'membro', full_name: name })
      .eq('id', newUser.user.id)

    // Add to team_members
    await supabaseAdmin
      .from('team_members')
      .insert({
        project_id: callerProfile.project_id,
        name,
        email,
        role: role || 'Membro',
        user_id: newUser.user.id,
      })

    // Send password reset email
    const origin = req.headers.origin || 'https://nascer2026.vercel.app'
    await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    return res.json({
      success: true,
      message: `Convite enviado para ${email}. O membro receberá um email para definir a senha.`,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
