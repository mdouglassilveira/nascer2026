import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAdminContext } from '../../hooks/useAdminContext'
import Loading from '../../components/Loading'
import { ClipboardList, CheckCircle2, FileEdit, Award, TrendingUp, MapPin } from 'lucide-react'

export default function AdminDashboard() {
  const ctx = useAdminContext()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['enrollment-stats', ctx?.centerId],
    queryFn: async () => {
      let query = supabase.from('vw_enrollment_stats').select('*')
      if (ctx.isCoordinator && ctx.centerId) {
        query = query.eq('center_id', ctx.centerId)
      }
      const { data } = await query
      return data || []
    },
    enabled: !!ctx,
  })

  if (isLoading || ctx?.isLoading) return <Loading />

  const totals = stats?.reduce((acc, s) => ({
    total: acc.total + (s.total || 0),
    draft: acc.draft + (s.draft_count || 0),
    submitted: acc.submitted + (s.submitted_count || 0),
    approved: acc.approved + (s.approved_count || 0),
    evaluated: acc.evaluated + (s.evaluated_count || 0),
  }), { total: 0, draft: 0, submitted: 0, approved: 0, evaluated: 0 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        {ctx?.isCoordinator && ctx.center && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5" />
            {ctx.center.name} - {ctx.center.city}
          </div>
        )}
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <StatCard icon={ClipboardList} label="Total inscrições" value={totals.total} color="bg-primary/10 text-primary" />
        <StatCard icon={FileEdit} label="Rascunhos" value={totals.draft} color="bg-warning/10 text-warning" />
        <StatCard icon={CheckCircle2} label="Submetidas" value={totals.submitted} color="bg-info/10 text-info" />
        <StatCard icon={Award} label="Avaliadas" value={totals.evaluated} color="bg-secondary/10 text-secondary" />
        <StatCard icon={TrendingUp} label="Aprovadas" value={totals.approved} color="bg-accent/10 text-accent" />
      </div>

      {/* Per center (only for admin) */}
      {ctx?.isAdmin && (
        <>
          <h2 className="text-lg font-bold mb-3">Por Centro de Inovação</h2>
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-bg/50">
                    <th className="text-left px-4 py-3 font-semibold text-text-muted">Centro</th>
                    <th className="text-center px-3 py-3 font-semibold text-text-muted">Total</th>
                    <th className="text-center px-3 py-3 font-semibold text-text-muted">Rascunho</th>
                    <th className="text-center px-3 py-3 font-semibold text-text-muted">Submetidas</th>
                    <th className="text-center px-3 py-3 font-semibold text-text-muted">Avaliadas</th>
                    <th className="text-center px-3 py-3 font-semibold text-text-muted">Aprovadas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.map(s => (
                    <tr key={s.center_id} className="border-b border-border/30 hover:bg-bg/30">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{s.center_name}</p>
                        <p className="text-xs text-text-muted">{s.center_city}</p>
                      </td>
                      <td className="text-center px-3 py-3 font-bold">{s.total}</td>
                      <td className="text-center px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning">{s.draft_count}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-info/10 text-info">{s.submitted_count}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{s.evaluated_count}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">{s.approved_count}</span>
                      </td>
                    </tr>
                  ))}
                  {(!stats || stats.length === 0) && (
                    <tr><td colSpan={6} className="text-center py-8 text-text-muted">Nenhuma inscrição ainda</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-text-muted font-medium">{label}</p>
    </div>
  )
}
