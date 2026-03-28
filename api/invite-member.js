import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
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

    // Get caller's participation (edition-aware)
    const { data: activeEdition } = await supabaseAdmin
      .from('editions')
      .select('id')
      .eq('active', true)
      .single()

    if (!activeEdition) return res.status(400).json({ error: 'Nenhuma edição ativa' })

    const { data: callerParticipation } = await supabaseAdmin
      .from('edition_participants')
      .select('project_id, center_id, role')
      .eq('user_id', caller.id)
      .eq('edition_id', activeEdition.id)
      .single()

    if (!callerParticipation?.project_id) {
      return res.status(400).json({ error: 'Você não tem um projeto nesta edição' })
    }

    const { name, email, role } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    // Check team size (from edition_participants)
    const { count: teamSize } = await supabaseAdmin
      .from('edition_participants')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', callerParticipation.project_id)
      .eq('edition_id', activeEdition.id)

    if ((teamSize ?? 0) >= 5) {
      return res.status(400).json({ error: 'Limite de 5 membros atingido' })
    }

    // Check if user already has a participation in this edition
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)

    let userId = existingUsers?.[0]?.id

    if (userId) {
      // User exists - check if already in this edition
      const { data: existingParticipation } = await supabaseAdmin
        .from('edition_participants')
        .select('id, project_id')
        .eq('user_id', userId)
        .eq('edition_id', activeEdition.id)
        .single()

      if (existingParticipation?.project_id === callerParticipation.project_id) {
        return res.status(400).json({ error: 'Este membro já faz parte da sua equipe' })
      }
      if (existingParticipation?.project_id) {
        return res.status(400).json({ error: 'Este email já está vinculado a outro projeto nesta edição' })
      }

      // User exists but no participation - create one
      if (existingParticipation && !existingParticipation.project_id) {
        await supabaseAdmin
          .from('edition_participants')
          .update({
            project_id: callerParticipation.project_id,
            center_id: callerParticipation.center_id,
            role: 'empreendedor',
            status: 'ativo',
          })
          .eq('id', existingParticipation.id)
      } else {
        // No participation at all - create new
        await supabaseAdmin
          .from('edition_participants')
          .insert({
            user_id: userId,
            edition_id: activeEdition.id,
            project_id: callerParticipation.project_id,
            center_id: callerParticipation.center_id,
            role: 'empreendedor',
            status: 'ativo',
          })
      }

      return res.json({ success: true, message: 'Membro vinculado ao projeto com sucesso!' })
    }

    // User doesn't exist - create new auth user
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

    userId = newUser.user.id

    // Update user profile
    await supabaseAdmin
      .from('users')
      .update({ full_name: name, status: 'convidado' })
      .eq('id', userId)

    // Create edition_participant
    await supabaseAdmin
      .from('edition_participants')
      .insert({
        user_id: userId,
        edition_id: activeEdition.id,
        project_id: callerParticipation.project_id,
        center_id: callerParticipation.center_id,
        role: 'empreendedor',
        status: 'convidado',
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
