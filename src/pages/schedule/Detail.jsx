import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { ArrowLeft, Video, MapPin, CheckCircle2, Play, FileText, Loader2 } from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      return data
    },
  })

  const { data: attendance } = useQuery({
    queryKey: ['attendance', id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('attendances').select('*').eq('event_id', id).eq('user_id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const markPresence = useMutation({
    mutationFn: async () => {
      if (attendance) {
        const { error } = await supabase.from('attendances').update({ status: 'presente' }).eq('id', attendance.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('attendances').insert({ event_id: id, user_id: user.id, status: 'presente' })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', id] })
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })

  if (isLoading) return <Loading />
  if (!event) return <p className="text-center text-text-muted py-8">Encontro não encontrado.</p>

  const isWorkshop = event.type === 'workshop'
  const isPresent = attendance?.status === 'presente'

  return (
    <div className="lg:px-0">
      {/* Hero header */}
      <div className={`px-5 pt-4 pb-8 ${
        isWorkshop
          ? 'bg-linear-to-br from-blue-500 to-cyan-500'
          : 'bg-linear-to-br from-orange-500 to-amber-500'
      }`}>
        <button onClick={() => navigate('/cronograma')} className="flex items-center gap-1.5 text-sm text-white/80 font-medium mb-4 active:opacity-70">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center gap-2 mb-2">
          {isWorkshop ? <Video className="w-4 h-4 text-white/70" /> : <MapPin className="w-4 h-4 text-white/70" />}
          <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
            {isWorkshop ? 'Workshop online' : 'Oficina presencial'}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-white">{event.title}</h1>
        <p className="text-white/70 text-sm mt-1">
          {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {event.time && ` - ${event.time}`}
        </p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl shadow-ambient-sm p-5 space-y-5">
          {event.description && (
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Descrição</p>
              <p className="text-sm whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {isWorkshop ? (
            <>
              {event.live_url && (
                <a
                  href={event.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white py-3.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
                >
                  <Play className="w-4 h-4" />
                  Assistir ao vivo
                </a>
              )}
              {event.replay_url && (
                <a
                  href={event.replay_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border-2 border-border py-3 rounded-lg text-sm font-semibold active:bg-gray-50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Assistir replay
                </a>
              )}
              {event.materials?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Materiais de apoio</p>
                  <div className="space-y-2">
                    {event.materials.map((mat, i) => (
                      <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary font-medium hover:underline py-1">
                        <FileText className="w-4 h-4" />
                        {mat.name || `Material ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            event.location && (
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Local</p>
                <p className="text-sm">{event.location}</p>
              </div>
            )
          )}

          {/* Presence */}
          <div className="pt-3 border-t border-border/50">
            {isPresent ? (
              <div className="flex items-center justify-center gap-2 text-secondary font-bold text-sm py-3 bg-secondary/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                Presença registrada
              </div>
            ) : (
              <button
                onClick={() => markPresence.mutate()}
                disabled={markPresence.isPending}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-secondary to-secondary-dark text-white py-3.5 rounded-lg text-sm font-semibold shadow-lg shadow-secondary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {markPresence.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Marcar presença
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
