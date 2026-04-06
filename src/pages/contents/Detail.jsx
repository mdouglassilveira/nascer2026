import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'
import { ArrowLeft } from 'lucide-react'

export default function ContentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const { data } = await supabase.from('contents').select('*').eq('id', id).single()
      return data
    },
  })

  if (isLoading) return <Loading />
  if (!content) return <p className="text-center text-text-muted py-8">Conteúdo não encontrado.</p>

  return (
    <div className="lg:px-0">
      {content.type === 'video' && content.video_url && (
        <div className="aspect-video bg-black">
          <iframe
            src={content.video_url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={content.title}
          />
        </div>
      )}

      <div className="px-4 pt-4">
        <button onClick={() => navigate('/conteudos')} className="flex items-center gap-1.5 text-sm text-text-muted font-medium mb-4 active:opacity-70">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-card rounded-xl shadow-ambient-sm p-5">
          {content.module && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{content.module}</span>
          )}
          <h1 className="text-xl font-extrabold mt-1">{content.title}</h1>
          {content.description && (
            <p className="text-sm text-text-muted mt-2">{content.description}</p>
          )}
          {content.body && (
            <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap border-t border-border/50 pt-4">{content.body}</div>
          )}
        </div>
      </div>
    </div>
  )
}
