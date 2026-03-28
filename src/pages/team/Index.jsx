import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { UserPlus, Trash2, Loader2, Users, X } from 'lucide-react'

const MAX_MEMBERS = 5

export default function Team() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '' })

  const { data: project } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('id').eq('user_id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const { data: members, isLoading } = useQuery({
    queryKey: ['team_members', project?.id],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*').eq('project_id', project.id).order('created_at', { ascending: true })
      return data || []
    },
    enabled: !!project,
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('team_members').insert({ project_id: project.id, ...form })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] })
      setForm({ name: '', email: '', role: '' })
      setShowForm(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (memberId) => {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team_members'] }),
  })

  if (isLoading) return <Loading />

  const count = members?.length || 0
  const canAdd = count < MAX_MEMBERS

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ]

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Header */}
      <div className="bg-linear-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 mb-5 shadow-lg shadow-teal-500/20">
        <div className="flex items-center justify-between">
          <div>
            <Users className="w-8 h-8 text-white mb-2" />
            <h2 className="text-white font-bold text-lg">Sua Equipe</h2>
            <p className="text-white/70 text-sm mt-0.5">{count} de {MAX_MEMBERS} membros</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_MEMBERS }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < count ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Add button */}
      {canAdd && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 mb-4 rounded-2xl text-sm font-semibold border-2 border-dashed border-primary/30 text-primary bg-primary/5 active:bg-primary/10 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar membro
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Novo membro</h3>
            <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate() }}
            className="space-y-3"
          >
            <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Papel na equipe" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Adicionar
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-3">
        {members?.map((member, i) => (
          <div key={member.id} className="bg-card rounded-2xl border border-border/50 shadow-sm shadow-black/5 p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-white font-bold text-sm">{member.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{member.name}</p>
              <p className="text-xs text-text-muted truncate">{member.role || member.email}</p>
            </div>
            <button
              onClick={() => removeMutation.mutate(member.id)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {count === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">Nenhum membro na equipe</p>
            <p className="text-xs text-text-muted mt-1">Adicione até 5 membros</p>
          </div>
        )}
      </div>
    </div>
  )
}
