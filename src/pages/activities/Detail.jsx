import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import Loading from '../../components/Loading'
import { ArrowLeft, Send, Loader2, CheckCircle2, Pencil } from 'lucide-react'

export default function ActivityDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { project } = useProject()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [answers, setAnswers] = useState({})

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data } = await supabase.from('activities').select('*').eq('id', id).single()
      return data
    },
  })

  const { data: existingResponse } = useQuery({
    queryKey: ['activity_response', id, project?.id],
    queryFn: async () => {
      const { data } = await supabase.from('activity_responses').select('*').eq('activity_id', id).eq('project_id', project.id).single()
      return data
    },
    enabled: !!project,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user.id, project_id: project.id, activity_id: id, answers, submitted_at: new Date().toISOString() }
      if (existingResponse) {
        const { error } = await supabase.from('activity_responses').update({ answers, submitted_at: new Date().toISOString() }).eq('id', existingResponse.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('activity_responses').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_responses'] })
      queryClient.invalidateQueries({ queryKey: ['activity_response', id] })
      navigate('/atividades')
    },
  })

  if (isLoading) return <Loading />
  if (!activity) return <p className="text-center text-text-muted py-8">Atividade não encontrada.</p>

  const fields = activity.fields || []
  const isAnswered = !!existingResponse
  const savedAnswers = existingResponse?.answers || {}

  return (
    <div className="px-4 pt-4 lg:px-0">
      <button onClick={() => navigate('/atividades')} className="flex items-center gap-1.5 text-sm text-text-muted font-medium mb-4 active:opacity-70">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-xl font-extrabold mb-1">{activity.title}</h1>
      {activity.description && (
        <p className="text-text-muted text-sm mb-5">{activity.description}</p>
      )}

      {isAnswered && !Object.keys(answers).length ? (
        <div className="bg-card rounded-3xl border border-secondary/20 shadow-sm shadow-black/5 overflow-hidden">
          <div className="bg-secondary/10 px-5 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <span className="text-sm font-bold text-secondary">Atividade respondida</span>
          </div>
          <div className="p-5 space-y-4">
            {fields.map((field, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{field.label}</p>
                <p className="text-sm mt-1">{savedAnswers[field.name] || '—'}</p>
              </div>
            ))}
            {fields.length === 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sua resposta</p>
                <p className="text-sm mt-1">{savedAnswers.response || '—'}</p>
              </div>
            )}
          </div>
          <div className="px-5 pb-5">
            <button
              onClick={() => setAnswers(savedAnswers)}
              className="flex items-center gap-2 text-sm text-primary font-semibold active:opacity-70"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar respostas
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
          className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 p-5 space-y-4"
        >
          {fields.map((field, i) => (
            <div key={i}>
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [field.name]: e.target.value }))}
                  rows={3}
                  placeholder="Descreva aqui..."
                  className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-text-muted/50"
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [field.name]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required={field.required}
                >
                  <option value="">Selecione uma opção...</option>
                  {field.options?.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [field.name]: e.target.value }))}
                  placeholder="Informe aqui..."
                  className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/50"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Sua resposta</label>
              <textarea
                value={answers.response || ''}
                onChange={e => setAnswers(a => ({ ...a, response: e.target.value }))}
                rows={4}
                placeholder="Escreva sua resposta aqui..."
                className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-text-muted/50"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar resposta
          </button>
        </form>
      )}
    </div>
  )
}
