import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { Radar, ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart } from 'recharts'
import { Brain, Loader2, RefreshCw } from 'lucide-react'

const QUESTIONS = [
  { key: 'comunicacao', label: 'Comunicação', question: 'Como você avalia sua comunicação?' },
  { key: 'lideranca', label: 'Liderança', question: 'Sua capacidade de liderança?' },
  { key: 'resiliencia', label: 'Resiliência', question: 'Sua resiliência diante de desafios?' },
  { key: 'criatividade', label: 'Criatividade', question: 'Sua criatividade e inovação?' },
  { key: 'trabalho_equipe', label: 'Trabalho em equipe', question: 'Seu trabalho em equipe?' },
  { key: 'gestao_tempo', label: 'Gestão de tempo', question: 'Sua gestão de tempo?' },
]

const OPTIONS = [
  { value: 1, label: '1', full: 'Iniciante' },
  { value: 2, label: '2', full: 'Básico' },
  { value: 3, label: '3', full: 'Intermediário' },
  { value: 4, label: '4', full: 'Avançado' },
  { value: 5, label: '5', full: 'Expert' },
]

export default function SoftSkills() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [answers, setAnswers] = useState({})

  const { data: existing, isLoading } = useQuery({
    queryKey: ['soft_skills', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('soft_skills').select('*').eq('user_id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user.id, answers, submitted_at: new Date().toISOString() }
      if (existing) {
        const { error } = await supabase.from('soft_skills').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('soft_skills').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soft_skills'] }),
  })

  if (isLoading) return <Loading />

  const hasResult = existing?.answers

  if (hasResult && !Object.keys(answers).length) {
    const chartData = QUESTIONS.map(q => ({
      subject: q.label,
      value: existing.answers[q.key] || 0,
      fullMark: 5,
    }))

    return (
      <div className="px-4 pt-4 lg:px-0">
        {/* Chart card */}
        <div className="bg-card rounded-3xl shadow-sm shadow-black/5 border border-border/50 overflow-hidden">
          <div className="bg-linear-to-br from-pink-500 to-rose-500 px-5 py-4">
            <h2 className="text-white font-bold">Seu perfil de competências</h2>
          </div>
          <div className="p-4">
            <div className="w-full h-64">
              <ResponsiveContainer>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#E8E5F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7194' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar name="Skills" dataKey="value" stroke="#6C3CE1" fill="#6C3CE1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="mt-4 space-y-2">
          {QUESTIONS.map(q => (
            <div key={q.key} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
              <span className="text-sm font-medium">{q.label}</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(v => (
                  <div key={v} className={`w-3 h-3 rounded-full ${v <= existing.answers[q.key] ? 'bg-primary' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAnswers(existing.answers)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold text-primary bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refazer questionário
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 lg:px-0">
      <div className="bg-linear-to-br from-pink-500 to-rose-500 rounded-3xl p-5 mb-5 shadow-lg shadow-pink-500/20">
        <Brain className="w-8 h-8 text-white mb-2" />
        <h2 className="text-white font-bold text-lg">Avalie suas competências</h2>
        <p className="text-white/70 text-sm mt-1">Responda de 1 (iniciante) a 5 (expert)</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
        className="space-y-4"
      >
        {QUESTIONS.map(q => (
          <div key={q.key} className="bg-card rounded-2xl border border-border/50 shadow-sm shadow-black/5 p-4">
            <p className="text-sm font-semibold mb-3">{q.question}</p>
            <div className="flex gap-2">
              {OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAnswers(a => ({ ...a, [q.key]: opt.value }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    answers[q.key] === opt.value
                      ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                      : 'bg-bg text-text-muted hover:bg-primary/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {answers[q.key] && (
              <p className="text-[10px] text-primary font-semibold mt-2 text-center">
                {OPTIONS.find(o => o.value === answers[q.key])?.full}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={mutation.isPending || Object.keys(answers).length < QUESTIONS.length}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-pink-500/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          Enviar avaliação
        </button>
      </form>
    </div>
  )
}
