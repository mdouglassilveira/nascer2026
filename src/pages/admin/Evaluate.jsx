import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useAdminContext } from '../../hooks/useAdminContext'
import Loading from '../../components/Loading'
import { Award, CheckCircle2, ChevronRight, Loader2, Star } from 'lucide-react'

export default function Evaluate() {
  const { user } = useAuth()
  const ctx = useAdminContext()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [scores, setScores] = useState({ score_problem: 5, score_market: 5, score_team: 5, score_resources: 5, comment: '' })

  // Get active edition
  const { data: edition } = useQuery({
    queryKey: ['active-edition'],
    queryFn: async () => {
      const { data } = await supabase.from('editions').select('id').eq('active', true).single()
      return data
    },
  })

  // Get submitted enrollments (coordenador sees only their center)
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments-to-evaluate', ctx?.centerId],
    queryFn: async () => {
      let query = supabase
        .from('enrollments')
        .select('id, full_name, project_title, center_id, centers(name, city)')
        .eq('status', 'submetida')
        .order('created_at')
      if (ctx.isCoordinator && ctx.centerId) {
        query = query.eq('center_id', ctx.centerId)
      }
      const { data } = await query
      return data || []
    },
    enabled: !!ctx,
  })

  // Get my evaluations
  const { data: myEvaluations } = useQuery({
    queryKey: ['my-evaluations', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('evaluations')
        .select('enrollment_id')
        .eq('evaluator_id', user.id)
      return new Set(data?.map(e => e.enrollment_id) || [])
    },
    enabled: !!user,
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('evaluations').insert({
        enrollment_id: selected,
        evaluator_id: user.id,
        edition_id: edition.id,
        ...scores,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-evaluations'] })
      setSelected(null)
      setScores({ score_problem: 5, score_market: 5, score_team: 5, score_resources: 5, comment: '' })
    },
  })

  if (isLoading) return <Loading />

  const pending = enrollments?.filter(e => !myEvaluations?.has(e.id)) || []
  const evaluated = enrollments?.filter(e => myEvaluations?.has(e.id)) || []

  // Evaluation form for selected enrollment
  if (selected) {
    const enrollment = enrollments?.find(e => e.id === selected)
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-sm text-text-muted font-medium mb-4 hover:text-text">
          ← Voltar à lista
        </button>

        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 mb-4">
          <h2 className="font-bold text-lg">{enrollment?.full_name}</h2>
          <p className="text-sm text-text-muted">{enrollment?.project_title}</p>
          <Link to={`/admin/inscricoes/${selected}`} className="text-xs text-primary font-medium mt-2 inline-block hover:underline">
            Ver inscrição completa →
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5">
          <h3 className="font-bold text-sm mb-4">Sua avaliação</h3>

          <div className="space-y-5">
            <ScoreSlider label="Problema e Solução" value={scores.score_problem} onChange={v => setScores(s => ({ ...s, score_problem: v }))} />
            <ScoreSlider label="Mercado e Inovação" value={scores.score_market} onChange={v => setScores(s => ({ ...s, score_market: v }))} />
            <ScoreSlider label="Perfil e Equipe" value={scores.score_team} onChange={v => setScores(s => ({ ...s, score_team: v }))} />
            <ScoreSlider label="Gestão e Recursos" value={scores.score_resources} onChange={v => setScores(s => ({ ...s, score_resources: v }))} />

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Comentário (opcional)</label>
              <textarea
                value={scores.comment}
                onChange={e => setScores(s => ({ ...s, comment: e.target.value }))}
                rows={3}
                placeholder="Observações sobre a inscrição..."
                className="input-field resize-none"
              />
            </div>

            <div className="bg-bg rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-extrabold text-primary">
                {scores.score_problem + scores.score_market + scores.score_team + scores.score_resources}/40
              </span>
            </div>

            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Enviar avaliação
            </button>

            {submitMutation.isError && (
              <p className="text-sm text-danger">{submitMutation.error?.message}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Avaliar inscrições</h1>
      <p className="text-sm text-text-muted mb-6">{pending.length} pendentes · {evaluated.length} avaliadas</p>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Pendentes</h2>
          <div className="space-y-2">
            {pending.map(e => (
              <button
                key={e.id}
                onClick={() => setSelected(e.id)}
                className="w-full flex items-center gap-3 bg-card rounded-2xl border border-border/50 shadow-sm p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{e.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{e.project_title} · {e.centers?.city}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evaluated */}
      {evaluated.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Avaliadas</h2>
          <div className="space-y-2">
            {evaluated.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-card rounded-2xl border border-secondary/20 p-4 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{e.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{e.project_title} · {e.centers?.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && evaluated.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma inscrição para avaliar</p>
        </div>
      )}
    </div>
  )
}

function ScoreSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</label>
        <span className="text-lg font-extrabold text-primary">{value}</span>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              v === value
                ? 'bg-primary text-white shadow-sm scale-110'
                : v < value
                  ? 'bg-primary/20 text-primary'
                  : 'bg-bg text-text-muted'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
