import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { Loader2, Stethoscope, CheckCircle2, RefreshCw } from 'lucide-react'

const DIAGNOSTIC_QUESTIONS = [
  { key: 'proposta_valor', label: 'Proposta de valor definida?' },
  { key: 'publico_alvo', label: 'Público-alvo identificado?' },
  { key: 'modelo_negocio', label: 'Modelo de negócio definido?' },
  { key: 'mvp', label: 'MVP desenvolvido?' },
  { key: 'validacao', label: 'Validação com clientes realizada?' },
  { key: 'equipe', label: 'Equipe formada?' },
  { key: 'financeiro', label: 'Planejamento financeiro feito?' },
  { key: 'marketing', label: 'Estratégia de marketing definida?' },
]

const OPTIONS = [
  { value: 'nao', label: 'Não', color: 'bg-danger/10 text-danger border-danger/20' },
  { value: 'parcial', label: 'Parcial', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'sim', label: 'Sim', color: 'bg-secondary/10 text-secondary border-secondary/20' },
]

export default function Diagnostic() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [answers, setAnswers] = useState({})

  const { data: existing, isLoading } = useQuery({
    queryKey: ['diagnostics', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('diagnostics').select('*').eq('user_id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user.id, answers, submitted_at: new Date().toISOString() }
      if (existing) {
        const { error } = await supabase.from('diagnostics').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('diagnostics').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      setAnswers({})
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] })
    },
  })

  if (isLoading) return <Loading />

  if (existing?.answers && !Object.keys(answers).length) {
    const saved = existing.answers
    const sim = Object.values(saved).filter(v => v === 'sim').length
    const parcial = Object.values(saved).filter(v => v === 'parcial').length
    const nao = DIAGNOSTIC_QUESTIONS.length - sim - parcial

    return (
      <div className="px-4 pt-4 lg:px-0">
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 overflow-hidden">
          <div className="bg-linear-to-br from-orange-500 to-amber-500 px-5 py-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-white font-bold">Diagnóstico concluído</span>
          </div>

          {/* Score circles */}
          <div className="grid grid-cols-3 gap-3 p-5">
            <ScoreCircle value={sim} label="Sim" color="text-secondary bg-secondary/10" />
            <ScoreCircle value={parcial} label="Parcial" color="text-warning bg-warning/10" />
            <ScoreCircle value={nao} label="Não" color="text-danger bg-danger/10" />
          </div>

          {/* Items */}
          <div className="px-5 pb-5 space-y-2">
            {DIAGNOSTIC_QUESTIONS.map(q => {
              const val = saved[q.key]
              const opt = OPTIONS.find(o => o.value === val)
              return (
                <div key={q.key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{q.label}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${opt?.color || 'bg-gray-100'}`}>
                    {opt?.label || '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setAnswers(existing.answers)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold text-primary bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refazer diagnóstico
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 lg:px-0">
      <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-3xl p-5 mb-5 shadow-lg shadow-orange-500/20">
        <Stethoscope className="w-8 h-8 text-white mb-2" />
        <h2 className="text-white font-bold text-lg">Diagnóstico do projeto</h2>
        <p className="text-white/70 text-sm mt-1">Avalie a maturidade da sua ideia</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
        className="space-y-3"
      >
        {DIAGNOSTIC_QUESTIONS.map(q => (
          <div key={q.key} className="bg-card rounded-2xl border border-border/50 shadow-sm shadow-black/5 p-4">
            <p className="text-sm font-semibold mb-3">{q.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAnswers(a => ({ ...a, [q.key]: opt.value }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    answers[q.key] === opt.value
                      ? opt.color + ' scale-105 shadow-sm'
                      : 'bg-bg border-transparent text-text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={mutation.isPending || Object.keys(answers).length < DIAGNOSTIC_QUESTIONS.length}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-orange-500/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
          Enviar diagnóstico
        </button>
      </form>
    </div>
  )
}

function ScoreCircle({ value, label, color }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${color}`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
    </div>
  )
}
