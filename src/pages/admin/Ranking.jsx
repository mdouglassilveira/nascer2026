import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'
import { Trophy, Medal, Filter } from 'lucide-react'

export default function Ranking() {
  const [centerFilter, setCenterFilter] = useState('all')

  const { data: centers } = useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const { data } = await supabase.from('centers').select('id, name, city').order('city')
      return data || []
    },
  })

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const { data } = await supabase.from('vw_enrollment_ranking').select('*')
      return data || []
    },
  })

  if (isLoading) return <Loading />

  const filtered = centerFilter === 'all'
    ? ranking
    : ranking?.filter(r => r.center_id === centerFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Ranking</h1>
        <span className="text-sm text-text-muted">{filtered?.length || 0} inscrições</span>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)} className="input-field w-auto min-w-[200px]">
          <option value="all">Todos os centros</option>
          {centers?.map(c => (
            <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
          ))}
        </select>
      </div>

      {/* Ranking list */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-bg/50">
                <th className="text-center px-3 py-3 font-semibold text-text-muted w-12">#</th>
                <th className="text-left px-3 py-3 font-semibold text-text-muted">Empreendedor</th>
                <th className="text-left px-3 py-3 font-semibold text-text-muted hidden lg:table-cell">Centro</th>
                <th className="text-center px-3 py-3 font-semibold text-text-muted">Algo.</th>
                <th className="text-center px-3 py-3 font-semibold text-text-muted">CI</th>
                <th className="text-center px-3 py-3 font-semibold text-text-muted">Comissão</th>
                <th className="text-center px-3 py-3 font-semibold text-text-muted">Aval.</th>
                <th className="text-center px-3 py-3 font-semibold text-primary font-bold">Final</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((r, i) => (
                <tr key={r.enrollment_id} className="border-b border-border/30 hover:bg-bg/30">
                  <td className="text-center px-3 py-3">
                    {i < 3 ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                        i === 0 ? 'bg-yellow-100 text-yellow-600' :
                        i === 1 ? 'bg-gray-100 text-gray-500' :
                        'bg-orange-100 text-orange-500'
                      }`}>
                        {i === 0 ? <Trophy className="w-3.5 h-3.5" /> : <Medal className="w-3.5 h-3.5" />}
                      </div>
                    ) : (
                      <span className="text-text-muted font-medium">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/admin/inscricoes/${r.enrollment_id}`} className="hover:text-primary">
                      <p className="font-semibold truncate max-w-[200px]">{r.full_name}</p>
                      <p className="text-xs text-text-muted truncate max-w-[200px]">{r.project_title}</p>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-muted hidden lg:table-cell">{r.center_city}</td>
                  <td className="text-center px-3 py-3">
                    <span className="text-xs font-bold">{r.algorithm_score}</span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className={`text-xs font-bold ${r.ci_score != null ? '' : 'text-text-muted'}`}>
                      {r.ci_score ?? '—'}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className="text-xs font-bold">{Number(r.avg_commission_score).toFixed(1)}</span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      r.evaluator_count > 0 ? 'bg-secondary/10 text-secondary' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {r.evaluator_count}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className="text-sm font-extrabold text-primary">{Number(r.final_score).toFixed(1)}</span>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted">Nenhuma inscrição no ranking</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
