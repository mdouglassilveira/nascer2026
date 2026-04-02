import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { Radar, ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart } from 'recharts'
import { Brain, Loader2, RefreshCw, Send, ArrowRight, ArrowLeft } from 'lucide-react'

// =====================================================
// 19 STATEMENTS
// =====================================================
const STATEMENTS = [
  { id: 1, text: 'Mesmo com dedicação, talvez eu não desenvolva novas habilidades.' },
  { id: 2, text: 'Vejo problemas como oportunidade de aprender algo novo.' },
  { id: 3, text: 'Erros e fracassos fazem parte do processo de evolução.' },
  { id: 4, text: 'Música é um dom natural, tem que nascer sabendo.' },
  { id: 5, text: 'Para todo vencedor existe um perdedor.' },
  { id: 6, text: 'Procuro fazer as coisas do jeito que estou acostumado a fazer.' },
  { id: 7, text: 'O importante é competir, vencer faz parte.' },
  { id: 8, text: 'Busco constantemente aprender coisas novas.' },
  { id: 9, text: 'Encaro feedbacks negativos sobre o meu trabalho como algo pessoal.' },
  { id: 10, text: 'Sempre abraço os desafios e procuro vencê-los.' },
  { id: 11, text: 'Eu sou aquilo que eu sou.' },
  { id: 12, text: 'Problemas só servem para atrapalhar a jornada.' },
  { id: 13, text: 'Sucesso deve ser para todos, servindo como fonte de inspiração.' },
  { id: 14, text: 'Quem é inteligente não precisa se esforçar tanto.' },
  { id: 15, text: 'Críticas são diferentes de feedbacks, elas não me fazem mudar.' },
  { id: 16, text: 'Habilidades podem ser adquiridas através de dedicação.' },
  { id: 17, text: 'Vale o esforço para chegar no topo e poder ficar na zona de conforto.' },
  { id: 18, text: 'Só começo algo se tenho a sensação de que terei sucesso.' },
  { id: 19, text: 'Preciso construir um bom produto para conquistar uma boa receita.' },
]

// Response options
const OPTIONS = [
  { key: 'C++', label: 'Concordo plenamente', value: 4, color: 'bg-secondary text-white' },
  { key: 'C+', label: 'Concordo', value: 3, color: 'bg-secondary/60 text-white' },
  { key: 'D-', label: 'Discordo', value: 2, color: 'bg-warning/80 text-white' },
  { key: 'D--', label: 'Discordo plenamente', value: 1, color: 'bg-danger/80 text-white' },
]

// Negative statements (reverse scoring: 5 - score)
const NEGATIVE_IDS = new Set([1, 4, 5, 6, 9, 11, 12, 14, 15, 18, 19])

// Question → Dimension mapping
const DIMENSIONS = {
  comunicacao: { label: 'Comunicação', questions: [9, 15] },
  lideranca: { label: 'Liderança', questions: [7, 10, 19] },
  resiliencia: { label: 'Resiliência', questions: [2, 3, 12, 18] },
  criatividade: { label: 'Criatividade', questions: [1, 4, 8, 11, 14, 17] },
  trabalho_equipe: { label: 'Trabalho em equipe', questions: [5, 13] },
  gestao_tempo: { label: 'Gestão de tempo', questions: [6, 16] },
}

// =====================================================
// SCORING ENGINE
// =====================================================
function calculateScores(responses) {
  const scores = {}

  for (const [dim, config] of Object.entries(DIMENSIONS)) {
    let total = 0
    let count = 0

    for (const qId of config.questions) {
      const answer = responses[`q${qId}`]
      if (!answer) continue

      const opt = OPTIONS.find(o => o.key === answer)
      if (!opt) continue

      let score = opt.value
      if (NEGATIVE_IDS.has(qId)) {
        score = 5 - score // reverse scoring
      }

      total += score
      count++
    }

    // Normalize to 0-100
    // Max per question is 4, so max total = count * 4
    scores[dim] = count > 0 ? Math.round((total / (count * 4)) * 100) : 0
  }

  return scores
}

// =====================================================
// COMPONENT
// =====================================================
export default function SoftSkills() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [responses, setResponses] = useState({})
  const [currentQ, setCurrentQ] = useState(0)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['soft_skills', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('soft_skills')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const scores = calculateScores(responses)
      const payload = {
        user_id: user.id,
        responses,
        scores,
        submitted_at: new Date().toISOString(),
      }
      if (existing) {
        const { error } = await supabase.from('soft_skills').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('soft_skills').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      setResponses({})
      setCurrentQ(0)
      queryClient.invalidateQueries({ queryKey: ['soft_skills'] })
    },
  })

  if (isLoading) return <Loading />

  const hasResult = existing?.scores && Object.keys(existing.scores).length > 0

  // =====================================================
  // RESULT VIEW
  // =====================================================
  if (hasResult && Object.keys(responses).length === 0) {
    const chartData = Object.entries(DIMENSIONS).map(([key, config]) => ({
      subject: config.label,
      value: existing.scores[key] || 0,
      fullMark: 100,
    }))

    const avgScore = Math.round(
      Object.values(existing.scores).reduce((a, b) => a + b, 0) / Object.keys(existing.scores).length
    )

    return (
      <div className="px-4 pt-4 lg:px-0 max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-card rounded-3xl shadow-sm shadow-black/5 border border-border/50 overflow-hidden">
          <div className="bg-linear-to-br from-pink-500 to-rose-500 px-5 py-4">
            <h2 className="text-white font-bold">Seu perfil comportamental</h2>
            <p className="text-white/60 text-xs mt-0.5">Score geral: {avgScore}/100</p>
          </div>

          {/* Radar chart */}
          <div className="p-4">
            <div className="w-full h-72">
              <ResponsiveContainer>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#E8E5F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7194' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Skills" dataKey="value" stroke="#6C3CE1" fill="#6C3CE1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="mt-4 space-y-2">
          {Object.entries(DIMENSIONS).map(([key, config]) => {
            const score = existing.scores[key] || 0
            return (
              <div key={key} className="bg-card rounded-2xl border border-border/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{config.label}</span>
                  <span className="text-sm font-extrabold text-primary">{score}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => {
            setResponses(existing.responses || {})
            setCurrentQ(0)
          }}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold text-primary bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refazer avaliação
        </button>
      </div>
    )
  }

  // =====================================================
  // QUESTIONNAIRE VIEW (one question at a time)
  // =====================================================
  const stmt = STATEMENTS[currentQ]
  const answered = Object.keys(responses).length
  const allAnswered = answered === STATEMENTS.length
  const currentAnswer = responses[`q${stmt.id}`]
  const isLast = currentQ === STATEMENTS.length - 1

  const handleSelect = (optKey) => {
    setResponses(r => ({ ...r, [`q${stmt.id}`]: optKey }))
  }

  const goNext = () => {
    if (currentQ < STATEMENTS.length - 1) {
      setCurrentQ(q => q + 1)
      window.scrollTo(0, 0)
    }
  }

  const goBack = () => {
    if (currentQ > 0) {
      setCurrentQ(q => q - 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="px-4 pt-4 lg:px-0 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-linear-to-br from-pink-500 to-rose-500 rounded-3xl p-5 mb-5 shadow-lg shadow-pink-500/20">
        <Brain className="w-8 h-8 text-white mb-2" />
        <h2 className="text-white font-bold text-lg">Soft Skills</h2>
        <p className="text-white/70 text-sm mt-1">Preencha todas as afirmações e depois clique em enviar.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / STATEMENTS.length) * 100}%` }}
            />
          </div>
          <span className="text-white text-xs font-bold">{currentQ + 1}/{STATEMENTS.length}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 p-5">
        <p className="text-xs font-bold text-text-muted mb-3">Afirmação {stmt.id}</p>
        <p className="text-base font-semibold mb-5 leading-relaxed">{stmt.text}</p>

        <div className="space-y-2.5">
          {OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.key)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                currentAnswer === opt.key
                  ? `${opt.color} shadow-sm scale-[1.02]`
                  : 'bg-bg text-text hover:bg-primary/5'
              }`}
            >
              <span className="font-bold mr-2">{opt.key}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentQ > 0 && (
            <button
              onClick={goBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-bg active:bg-border/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}

          {isLast ? (
            <button
              onClick={() => mutation.mutate()}
              disabled={!allAnswered || mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 text-white py-3 rounded-2xl text-sm font-semibold shadow-md shadow-pink-500/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!currentAnswer}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Avançar
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick nav dots */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-4">
          {STATEMENTS.map((s, i) => {
            const isAnswered = !!responses[`q${s.id}`]
            const isCurrent = i === currentQ
            return (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-6 h-6 rounded-full text-[9px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-white scale-110'
                    : isAnswered
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-gray-100 text-text-muted'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
