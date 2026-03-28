import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useProject } from '../../hooks/useProject'
import Loading from '../../components/Loading'
import { CheckCircle2, ClipboardList, ChevronRight, Zap } from 'lucide-react'

export default function Activities() {
  const { project, isLoading: projectLoading } = useProject()

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data } = await supabase.from('activities').select('*').order('order_index', { ascending: true })
      return data || []
    },
  })

  const { data: responses } = useQuery({
    queryKey: ['activity_responses', project?.id],
    queryFn: async () => {
      const { data } = await supabase.from('activity_responses').select('activity_id').eq('project_id', project.id)
      return data?.map(r => r.activity_id) || []
    },
    enabled: !!project,
  })

  if (isLoading || projectLoading) return <Loading />

  const completedIds = new Set(responses || [])
  const total = activities?.length || 0
  const done = completedIds.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Progress header */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 mb-5 shadow-lg shadow-emerald-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-bold text-sm">Progresso do projeto</span>
          </div>
          <span className="text-white font-extrabold text-xl">{pct}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-white/70 text-xs mt-2">{done} de {total} atividades concluídas</p>
      </div>

      {/* Activities list */}
      <div className="space-y-2.5">
        {activities?.map((activity, i) => {
          const isDone = completedIds.has(activity.id)
          return (
            <Link
              key={activity.id}
              to={`/atividades/${activity.id}`}
              className={`flex items-center gap-3.5 bg-card rounded-2xl p-4 shadow-sm shadow-black/5 border active:scale-[0.98] transition-transform ${
                isDone ? 'border-secondary/30' : 'border-border/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDone ? 'bg-secondary/10' : 'bg-gray-100'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                ) : (
                  <span className="text-xs font-bold text-text-muted">{String(i + 1).padStart(2, '0')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isDone ? 'text-text-muted line-through' : ''}`}>
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-text-muted truncate mt-0.5">{activity.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            </Link>
          )
        })}

        {total === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">Nenhuma atividade disponível</p>
          </div>
        )}
      </div>
    </div>
  )
}
