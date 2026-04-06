import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminContext } from '../../hooks/useAdminContext'
import Loading from '../../components/Loading'
import { Search, ChevronRight, MapPin } from 'lucide-react'

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', color: 'bg-warning/10 text-warning' },
  submetida: { label: 'Submetida', color: 'bg-info/10 text-info' },
  aprovada: { label: 'Aprovada', color: 'bg-secondary/10 text-secondary' },
  desistente: { label: 'Desistente', color: 'bg-surface text-gray-500' },
}

export default function Enrollments() {
  const ctx = useAdminContext()
  const [statusFilter, setStatusFilter] = useState('all')
  const [centerFilter, setCenterFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data: centers } = useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const { data } = await supabase.from('centers').select('id, name, city').order('city')
      return data || []
    },
  })

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['admin-enrollments', ctx?.centerId],
    queryFn: async () => {
      let query = supabase
        .from('enrollments')
        .select('id, user_id, full_name, phone, project_title, status, form_step, center_id, submitted_at, created_at, centers(name, city)')
        .order('created_at', { ascending: false })

      // Coordenador: only their center
      if (ctx.isCoordinator && ctx.centerId) {
        query = query.eq('center_id', ctx.centerId)
      }

      const { data } = await query
      return data || []
    },
    enabled: !!ctx,
  })

  if (isLoading || ctx?.isLoading) return <Loading />

  const filtered = enrollments?.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (centerFilter !== 'all' && e.center_id !== centerFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.full_name?.toLowerCase().includes(q) && !e.project_title?.toLowerCase().includes(q) && !e.phone?.includes(q)) return false
    }
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold">Inscrições</h1>
          {ctx?.isCoordinator && ctx.center && (
            <div className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
              <MapPin className="w-3 h-3" /> {ctx.center.name} - {ctx.center.city}
            </div>
          )}
        </div>
        <span className="text-sm text-text-muted">{filtered?.length || 0} resultados</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, projeto ou telefone..."
            className="input-field pl-10"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto min-w-[150px]">
          <option value="all">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="submetida">Submetida</option>
          <option value="aprovada">Aprovada</option>
          <option value="desistente">Desistente</option>
        </select>
        {/* Center filter only for admin */}
        {ctx?.isAdmin && (
          <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)} className="input-field w-auto min-w-[180px]">
            <option value="all">Todos os centros</option>
            {centers?.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered?.map(e => {
          const st = STATUS_CONFIG[e.status] || STATUS_CONFIG.rascunho
          return (
            <Link
              key={e.id}
              to={`/admin/inscricoes/${e.id}`}
              className="flex items-center gap-3 bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate">{e.full_name || 'Sem nome'}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate">{e.project_title || 'Projeto não informado'}</p>
                <div className="flex items-center gap-3 mt-1">
                  {ctx?.isAdmin && <span className="text-[10px] text-text-muted">{e.centers?.name} - {e.centers?.city}</span>}
                  {e.status === 'rascunho' && (
                    <span className="text-[10px] text-warning font-medium">Etapa {e.form_step + 1}/4</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            </Link>
          )
        })}

        {filtered?.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="font-medium">Nenhuma inscrição encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
