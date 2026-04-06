import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Send, Loader2, Bot, FileText, ExternalLink, Sparkles } from 'lucide-react'

export default function Tools() {
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data } = await supabase.from('contents').select('id, title, type, video_url').eq('type', 'material').order('title')
      return data || []
    },
  })

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setResponse('')

    try {
      await supabase.from('questions_ai').insert({ user_id: user.id, question: question.trim() })
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: { question: question.trim(), user_id: user.id },
      })
      if (error) throw error
      setResponse(data?.answer || 'Não foi possível gerar uma resposta.')
    } catch {
      setResponse('Serviço de IA indisponível no momento. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* AI Header */}
      <div className="bg-linear-to-br from-primary to-primary-light rounded-xl p-5 mb-5 shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-card/5 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-lg bg-card/15 backdrop-blur-md flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white font-bold text-lg">Assistente IA</h2>
          <p className="text-white/60 text-sm mt-0.5">Tire dúvidas sobre empreendedorismo</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-card rounded-xl shadow-ambient-sm p-5 mb-4">
        <form onSubmit={handleAsk} className="space-y-3">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Pergunte sobre modelo de negócios, pitch, mercado..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-lg text-sm font-semibold shadow-ambient-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar pergunta
          </button>
        </form>

        {response && (
          <div className="mt-4 bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">Resposta</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{response}</p>
          </div>
        )}
      </div>

      {/* Materials */}
      {materials && materials.length > 0 && (
        <div className="bg-card rounded-xl shadow-ambient-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Materiais de apoio</h3>
          </div>
          <div className="space-y-2">
            {materials.map(mat => (
              <a
                key={mat.id}
                href={mat.video_url || `/conteudos/${mat.id}`}
                target={mat.video_url ? '_blank' : undefined}
                rel={mat.video_url ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-bg transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-primary">{mat.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
