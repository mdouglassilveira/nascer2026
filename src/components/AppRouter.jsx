import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

/**
 * Smart router that decides where to send the user based on role:
 * - admin/avaliador/coordenador → /admin
 * - empreendedor with project → Dashboard (children)
 * - empreendedor without project → /inscricao
 */
export default function AppRouter({ children }) {
  const { user } = useAuth()

  const { data: routing, isLoading } = useQuery({
    queryKey: ['user-routing', user?.id],
    queryFn: async () => {
      const { data: edition } = await supabase
        .from('editions')
        .select('id, enrollment_open, name')
        .eq('active', true)
        .single()

      if (!edition) return { destination: 'no-edition' }

      // Check participation in active edition
      const { data: participation } = await supabase
        .from('edition_participants')
        .select('id, project_id, role, status')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      // Staff roles go to admin
      if (participation?.role && ['admin', 'avaliador', 'coordenador'].includes(participation.role)) {
        return { destination: 'admin', participation }
      }

      // Empreendedor with project
      if (participation?.project_id) {
        return { destination: 'app', participation }
      }

      // Check enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status, form_step')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      if (enrollment) {
        return { destination: 'enrollment', enrollment, edition }
      }

      return {
        destination: edition.enrollment_open ? 'enrollment' : 'closed',
        edition,
      }
    },
    enabled: !!user,
  })

  if (isLoading) return <Loading />

  const dest = routing?.destination

  if (dest === 'admin') return <Navigate to="/admin" replace />
  if (dest === 'app') return children
  if (dest === 'enrollment') return <Navigate to="/inscricao" replace />
  if (dest === 'closed' || dest === 'no-edition') return <Navigate to="/inscricao" replace />

  return children
}
