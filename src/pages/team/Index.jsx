import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import Loading from '../../components/Loading'
import { UserPlus, Loader2, Users, X, Crown, Mail, CheckCircle2 } from 'lucide-react'

const MAX_MEMBERS = 5

export default function Team() {
  const { user } = useAuth()
  const { project, isLoading: projectLoading } = useProject()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '' })
  const [inviteMsg, setInviteMsg] = useState('')

  // Get ALL users linked to this project (active + invited)
  const { data: members, isLoading } = useQuery({
    queryKey: ['project_members', project?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email, role, avatar_url, status')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true })
      return data || []
    },
    enabled: !!project,
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/invite-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email, role: form.role }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao convidar')
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project_members'] })
      queryClient.invalidateQueries({ queryKey: ['team_count'] })
      setForm({ name: '', email: '', role: '' })
      setShowForm(false)
      setInviteMsg(data.message)
      setTimeout(() => setInviteMsg(''), 5000)
    },
  })

  if (isLoading || projectLoading) return <Loading />

  const totalCount = members?.length || 0
  const canAdd = totalCount < MAX_MEMBERS

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ]

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Invite success message */}
      {inviteMsg && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-secondary">Convite enviado!</p>
            <p className="text-xs text-text-muted mt-0.5">{inviteMsg}</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {addMutation.isError && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-danger">{addMutation.error?.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-linear-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 mb-5 shadow-lg shadow-teal-500/20">
        <div className="flex items-center justify-between">
          <div>
            <Users className="w-8 h-8 text-white mb-2" />
            <h2 className="text-white font-bold text-lg">Sua Equipe</h2>
            <p className="text-white/70 text-sm mt-0.5">{totalCount} de {MAX_MEMBERS} membros</p>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_MEMBERS }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < totalCount ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-2.5">
        {members?.map((member, i) => {
          const isActive = member.status === 'ativo'
          const isFounder = member.role === 'founder'

          return (
            <div key={member.id} className={`bg-card rounded-2xl border border-border/50 shadow-sm shadow-black/5 p-4 flex items-center gap-3 ${!isActive ? 'opacity-70' : ''}`}>
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              ) : (
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${isActive ? colors[i % colors.length] : 'from-gray-300 to-gray-400'} flex items-center justify-center shrink-0 shadow-sm`}>
                  <span className="text-white font-bold text-sm">{(member.full_name || member.email).charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{member.full_name || member.email}</p>
                  {isFounder && <Crown className="w-3.5 h-3.5 text-warning shrink-0" />}
                </div>
                <p className="text-xs text-text-muted truncate">{member.email}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'bg-warning/10 text-warning'
              }`}>
                {isActive ? 'Ativo' : 'Convidado'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {totalCount <= 1 && !showForm && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-muted font-medium">Adicione membros à sua equipe</p>
          <p className="text-xs text-text-muted mt-1">Até {MAX_MEMBERS} membros por projeto</p>
        </div>
      )}

      {/* Add button */}
      {canAdd && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-3 rounded-2xl text-sm font-semibold border-2 border-dashed border-primary/30 text-primary bg-primary/5 active:bg-primary/10 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar membro
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 p-5 mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Convidar membro</h3>
            <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate() }}
            className="space-y-3"
          >
            <input type="text" placeholder="Nome do membro" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/50" />
            <input type="email" placeholder="Email do membro" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/50" />
            <input type="text" placeholder="Papel na equipe (ex: Desenvolvedor)" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/50" />
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar convite
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
