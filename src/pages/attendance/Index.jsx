import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import Loading from '../../components/Loading'
import { CheckCircle2, XCircle, Clock, CalendarCheck } from 'lucide-react'

export default function Attendance() {
  const { user } = useAuth()
  const { project, isLoading: projectLoading } = useProject()

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
      return data || []
    },
  })

  // Get all team member user IDs for this project
  const { data: teamUserIds } = useQuery({
    queryKey: ['team_user_ids', project?.id],
    queryFn: async () => {
      const ids = [project.user_id]
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('project_id', project.id)
        .not('user_id', 'is', null)
      if (members) ids.push(...members.map(m => m.user_id))
      return ids
    },
    enabled: !!project,
  })

  // Fetch attendances for ALL team members
  const { data: attendances, isLoading: attLoading } = useQuery({
    queryKey: ['attendances_team', teamUserIds],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendances')
        .select('*')
        .in('user_id', teamUserIds)
      return data || []
    },
    enabled: !!teamUserIds?.length,
  })

  if (eventsLoading || attLoading || projectLoading) return <Loading />

  // For each event, check if ANY team member is present
  const eventStatusMap = new Map()
  for (const att of (attendances || [])) {
    const current = eventStatusMap.get(att.event_id)
    if (att.status === 'presente') {
      eventStatusMap.set(att.event_id, 'presente')
    } else if (!current) {
      eventStatusMap.set(att.event_id, att.status)
    }
  }

  const present = [...eventStatusMap.values()].filter(s => s === 'presente').length
  const total = events?.length || 0
  const pct = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Header */}
      <div className="bg-linear-to-br from-indigo-500 to-blue-600 rounded-3xl p-5 mb-5 shadow-lg shadow-indigo-500/20">
        <CalendarCheck className="w-8 h-8 text-white mb-2" />
        <h2 className="text-white font-bold text-lg">Presenças</h2>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-white font-extrabold text-sm">{present}/{total}</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {events?.map(event => {
          const status = eventStatusMap.get(event.id)
          const isPresent = status === 'presente'
          const isAbsent = status === 'ausente'

          return (
            <div
              key={event.id}
              className={`bg-card rounded-2xl border shadow-sm shadow-black/5 p-4 flex items-center gap-3 ${
                isPresent ? 'border-secondary/30' : isAbsent ? 'border-danger/30' : 'border-border/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPresent ? 'bg-secondary/10' : isAbsent ? 'bg-danger/10' : 'bg-gray-100'
              }`}>
                {isPresent ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                ) : isAbsent ? (
                  <XCircle className="w-5 h-5 text-danger" />
                ) : (
                  <Clock className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-text-muted">
                  {new Date(event.date).toLocaleDateString('pt-BR')}
                  {event.time && ` - ${event.time}`}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isPresent ? 'bg-secondary/10 text-secondary' :
                isAbsent ? 'bg-danger/10 text-danger' :
                'bg-gray-100 text-text-muted'
              }`}>
                {isPresent ? 'Presente' : isAbsent ? 'Ausente' : 'Pendente'}
              </span>
            </div>
          )
        })}

        {total === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">Nenhum encontro registrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
