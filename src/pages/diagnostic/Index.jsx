import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { Loader2, Stethoscope, RefreshCw, Send, ArrowRight, ArrowLeft, AlertTriangle, Target, Users2, ShoppingBag, Lightbulb, Megaphone, DollarSign, Rocket, UserCheck, Presentation } from 'lucide-react'

// =====================================================
// 10 DIAGNOSTIC QUESTIONS
// =====================================================
const QUESTIONS = [
  {
    id: 'problema',
    category: 'Problema',
    icon: AlertTriangle,
    color: 'bg-red-500',
    question: 'Você identificou claramente o problema que seu projeto resolve?',
    options: [
      'Ainda não identifiquei o problema.',
      'Tenho uma ideia inicial do problema, mas não está bem definida.',
      'O problema está bem definido, mas precisa de mais validação.',
      'O problema está claro e já comecei a validá-lo com clientes.',
      'O problema está completamente validado com evidências de mercado.',
    ],
  },
  {
    id: 'validacao',
    category: 'Avaliação',
    icon: Target,
    color: 'bg-blue-500',
    question: 'Você já validou sua solução com o público-alvo?',
    options: [
      'Não realizei nenhuma validação até o momento.',
      'Realizei conversas informais, mas sem validação estruturada.',
      'Fiz uma validação inicial, mas os dados ainda são insuficientes.',
      'Realizei validações sólidas com alguns potenciais clientes.',
      'Minha solução está validada por meio de testes consistentes com o público-alvo.',
    ],
  },
  {
    id: 'cliente',
    category: 'Cliente ideal',
    icon: Users2,
    color: 'bg-cyan-500',
    question: 'Você definiu o perfil do seu cliente ideal?',
    options: [
      'Ainda não defini o cliente ideal.',
      'Tenho uma ideia geral do cliente ideal, mas é vaga.',
      'Tenho uma definição razoável do meu cliente ideal, mas não testada.',
      'Meu cliente ideal está definido e já validei esse perfil com parte do mercado.',
      'Tenho o perfil claro e validado do cliente ideal, com dados concretos.',
    ],
  },
  {
    id: 'mercado',
    category: 'Mercado',
    icon: ShoppingBag,
    color: 'bg-emerald-500',
    question: 'Você conhece o mercado em que seu projeto está inserido?',
    options: [
      'Não conheço o mercado do meu projeto.',
      'Tenho um conhecimento básico do mercado, mas preciso de mais dados.',
      'Tenho um bom conhecimento do mercado, mas ainda falta análise aprofundada.',
      'Entendo o mercado e suas dinâmicas principais.',
      'Possuo um conhecimento detalhado e atualizado sobre o mercado, com análise de concorrentes.',
    ],
  },
  {
    id: 'produto',
    category: 'Produto',
    icon: Lightbulb,
    color: 'bg-amber-500',
    question: 'Em que estágio está o desenvolvimento da sua solução ou produto?',
    options: [
      'Ainda não comecei o desenvolvimento da solução.',
      'Tenho uma ideia clara da solução, mas ainda está na fase de planejamento.',
      'A solução está em desenvolvimento e prestes a ser testada.',
      'Já tenho uma versão mínima da solução (MVP) e estou começando a testar.',
      'A solução está validada por meio de testes com usuários e já gera resultados.',
    ],
  },
  {
    id: 'marketing',
    category: 'Marketing',
    icon: Megaphone,
    color: 'bg-purple-500',
    question: 'Você já estruturou ações de marketing para seu projeto?',
    options: [
      'Não pensei em ações de marketing ainda.',
      'Tenho ideias iniciais de marketing, mas nada estruturado.',
      'Tenho um plano básico de marketing, mas não executado.',
      'Já comecei a executar algumas ações de marketing.',
      'Tenho um plano de marketing estruturado e em plena execução.',
    ],
  },
  {
    id: 'vendas',
    category: 'Vendas',
    icon: DollarSign,
    color: 'bg-green-500',
    question: 'Você já começou a estruturar ou realizar vendas do seu produto/serviço?',
    options: [
      'Ainda não comecei a estruturar vendas.',
      'Tenho uma ideia de como vou vender, mas ainda não executei.',
      'Comecei a estruturar um processo de vendas, mas ainda sem resultados concretos.',
      'Já fiz algumas vendas ou pré-vendas do produto/serviço.',
      'Possuo um processo de vendas estruturado e funcionando com resultados mensuráveis.',
    ],
  },
  {
    id: 'fomento',
    category: 'Fomento',
    icon: Rocket,
    color: 'bg-orange-500',
    question: 'Você já buscou formas de fomento ou investimento para o projeto?',
    options: [
      'Não busquei fomento ou investimento até o momento.',
      'Conheço algumas opções de fomento, mas ainda não apliquei para nenhuma.',
      'Já busquei investimento ou fomento, mas sem sucesso.',
      'Recebi interesse de investidores ou fomentei via editais públicos/privados.',
      'Já obtive investimento ou fomento suficiente para o atual estágio do projeto.',
    ],
  },
  {
    id: 'empreendedor',
    category: 'Empreendedor',
    icon: UserCheck,
    color: 'bg-indigo-500',
    question: 'Você já teve alguma experiência empreendedora?',
    options: [
      'Primeira vez que vou empreender.',
      'Já empreendi anteriormente.',
      'Já empreendi anteriormente no setor do meu projeto.',
      'Empreendo atualmente no setor do meu projeto.',
      'Possuo um CNPJ ativo no setor do meu projeto.',
    ],
  },
  {
    id: 'pitch',
    category: 'Pitch',
    icon: Presentation,
    color: 'bg-pink-500',
    question: 'Você já estruturou e apresentou um pitch do seu projeto?',
    options: [
      'Não estruturei nem apresentei um pitch do meu projeto.',
      'Tenho uma ideia de como apresentar, mas ainda não fiz a apresentação.',
      'Estruturei um pitch básico, mas ainda não apresentei.',
      'Já apresentei o pitch do meu projeto para algumas partes interessadas, mas ele ainda pode ser refinado.',
      'Tenho um pitch estruturado, e já o apresentei com sucesso a potenciais parceiros ou investidores.',
    ],
  },
]

// =====================================================
// COMPONENT
// =====================================================
export default function Diagnostic() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [responses, setResponses] = useState({})
  const [currentQ, setCurrentQ] = useState(0)

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
      // Calculate scores: each answer = index + 1 (1-5)
      const scores = {}
      let totalScore = 0
      for (const q of QUESTIONS) {
        const val = responses[q.id]
        if (val !== undefined) {
          scores[q.id] = val + 1 // 0-indexed → 1-5
          totalScore += val + 1
        }
      }

      const payload = {
        user_id: user.id,
        responses,
        scores,
        total_score: totalScore,
        submitted_at: new Date().toISOString(),
      }

      if (existing) {
        const { error } = await supabase.from('diagnostics').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('diagnostics').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      setResponses({})
      setCurrentQ(0)
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] })
    },
  })

  if (isLoading) return <Loading />

  const hasResult = existing?.scores && Object.keys(existing.scores).length > 0

  // =====================================================
  // RESULT VIEW
  // =====================================================
  if (hasResult && Object.keys(responses).length === 0) {
    const totalScore = existing.total_score || 0
    const maxScore = QUESTIONS.length * 5
    const pct = Math.round((totalScore / maxScore) * 100)

    return (
      <div className="px-4 pt-4 lg:px-0 max-w-lg mx-auto">
        {/* Score header */}
        <div className="bg-card rounded-xl shadow-ambient-sm overflow-hidden">
          <div className="bg-linear-to-br from-orange-500 to-amber-500 px-5 py-5">
            <p className="text-white/70 text-xs font-medium">Maturidade Total</p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-4xl font-extrabold text-white">{totalScore}/{maxScore}</span>
              <div className="mb-1.5 w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">{pct}%</span>
              </div>
            </div>
          </div>

          {/* Distribution chart */}
          <div className="p-5">
            <h3 className="text-sm font-bold mb-4">Distribuição de Maturidade</h3>
            <div className="space-y-3">
              {QUESTIONS.map(q => {
                const score = existing.scores[q.id] || 0
                const Icon = q.icon
                return (
                  <div key={q.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${q.color} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold">{q.category}</span>
                      </div>
                      <span className="text-xs font-bold text-text-muted">{score}/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${q.color}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category detail */}
        <div className="mt-4">
          <h3 className="text-sm font-bold mb-3">Visão por Categoria</h3>
          <div className="space-y-2">
            {QUESTIONS.map(q => {
              const score = existing.scores[q.id] || 0
              const answerIdx = existing.responses?.[q.id]
              const answerText = answerIdx !== undefined ? q.options[answerIdx] : '—'
              const Icon = q.icon
              return (
                <div key={q.id} className="bg-card rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-md ${q.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold">{q.category}</span>
                    <span className="ml-auto text-sm font-extrabold text-primary">{score}/5</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{answerText}</p>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            setResponses(existing.responses || {})
            setCurrentQ(0)
          }}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-lg text-sm font-semibold text-primary bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refazer diagnóstico
        </button>
      </div>
    )
  }

  // =====================================================
  // QUESTIONNAIRE VIEW (one question at a time)
  // =====================================================
  const q = QUESTIONS[currentQ]
  const Icon = q.icon
  const answered = Object.keys(responses).length
  const allAnswered = answered === QUESTIONS.length
  const currentAnswer = responses[q.id]
  const isLast = currentQ === QUESTIONS.length - 1

  return (
    <div className="px-4 pt-4 lg:px-0 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-xl p-5 mb-5 shadow-lg shadow-orange-500/20">
        <Stethoscope className="w-8 h-8 text-white mb-2" />
        <h2 className="text-white font-bold text-lg">Diagnóstico</h2>
        <p className="text-white/70 text-sm mt-1">Responda as perguntas para receber a análise</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="text-white text-xs font-bold">{currentQ + 1}/{QUESTIONS.length}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-xl shadow-ambient-sm p-5">
        {/* Category badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${q.color} mb-4`}>
          <Icon className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white">{q.category}</span>
        </div>

        <p className="text-lg font-bold mb-5 leading-snug">{q.question}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setResponses(r => ({ ...r, [q.id]: i }))}
              className={`w-full text-left px-4 py-3.5 rounded-lg text-sm transition-all border ${
                currentAnswer === i
                  ? 'bg-primary text-white border-primary shadow-sm scale-[1.01]'
                  : 'bg-bg text-text border-transparent hover:border-primary/20'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentQ > 0 && (
            <button
              onClick={() => { setCurrentQ(q => q - 1); window.scrollTo(0, 0) }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-bg active:bg-border/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}

          {isLast ? (
            <button
              onClick={() => mutation.mutate()}
              disabled={!allAnswered || mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg text-sm font-semibold shadow-md shadow-orange-500/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar diagnóstico
            </button>
          ) : (
            <button
              onClick={() => { setCurrentQ(q => q + 1); window.scrollTo(0, 0) }}
              disabled={currentAnswer === undefined}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3 rounded-lg text-sm font-semibold shadow-ambient-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Avançar
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
