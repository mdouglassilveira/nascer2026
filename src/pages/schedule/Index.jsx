import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'
import { Calendar, Video, MapPin, ChevronRight } from 'lucide-react'

export default function Schedule() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
      return data || []
    },
  })

  if (isLoading) return <Loading />

  const now = new Date()
  const upcoming = events?.filter(e => new Date(e.date) >= now) || []
  const past = events?.filter(e => new Date(e.date) < now) || []

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Next event highlight */}
      {upcoming.length > 0 && (
        <Link
          to={`/cronograma/${upcoming[0].id}`}
          className="block mb-5"
        >
          <div className={`rounded-xl p-5 shadow-lg ${
            upcoming[0].type === 'workshop'
              ? 'bg-linear-to-br from-blue-500 to-cyan-500 shadow-blue-500/20'
              : 'bg-linear-to-br from-orange-500 to-amber-500 shadow-orange-500/20'
          }`}>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Próximo encontro</p>
            <h2 className="text-white font-extrabold text-lg mt-1">{upcoming[0].title}</h2>
            <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(upcoming[0].date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                {upcoming[0].time && ` - ${upcoming[0].time}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {upcoming[0].type === 'workshop'
                ? <><Video className="w-3.5 h-3.5 text-white/70" /><span className="text-xs text-white/70 font-medium">Online</span></>
                : <><MapPin className="w-3.5 h-3.5 text-white/70" /><span className="text-xs text-white/70 font-medium">Presencial</span></>
              }
            </div>
          </div>
        </Link>
      )}

      {/* Upcoming */}
      {upcoming.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-text mb-3">Em breve</h3>
          <div className="space-y-2.5">
            {upcoming.slice(1).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text-muted mb-3">Anteriores</h3>
          <div className="space-y-2.5">
            {past.map(event => (
              <EventCard key={event.id} event={event} faded />
            ))}
          </div>
        </div>
      )}

      {events?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-muted font-medium">Nenhum encontro agendado</p>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, faded }) {
  const isWorkshop = event.type === 'workshop'
  return (
    <Link
      to={`/cronograma/${event.id}`}
      className={`bg-card rounded-lg p-4 flex items-center gap-3.5 shadow-ambient-sm active:scale-[0.98] transition-transform ${faded ? 'opacity-60' : ''}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        isWorkshop ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
      }`}>
        {isWorkshop ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{event.title}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {new Date(event.date).toLocaleDateString('pt-BR')}
          {event.time && ` - ${event.time}`}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
    </Link>
  )
}
