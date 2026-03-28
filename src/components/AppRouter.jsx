import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

/**
 * Smart router that decides where to send the user:
 * 1. Has project in active edition → Dashboard (empreendedor app)
 * 2. Has enrollment in active edition → Enrollment status page
 * 3. No enrollment → Check if enrollments open → Enrollment form or closed message
 */
export default function AppRouter({ children, enrollmentPage }) {
  const { user } = useAuth()

  const { data: routing, isLoading } = useQuery({
    queryKey: ['user-routing', user?.id],
    queryFn: async () => {
      // Get active edition
      const { data: edition } = await supabase
        .from('editions')
        .select('id, enrollment_open, name')
        .eq('active', true)
        .single()

      if (!edition) return { destination: 'no-edition' }

      // Check if user has a participation with project (approved)
      const { data: participation } = await supabase
        .from('edition_participants')
        .select('id, project_id, role, status')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      if (participation?.project_id) {
        return { destination: 'app', participation }
      }

      // Check if user has an enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status, form_step')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      if (enrollment) {
        return { destination: 'enrollment', enrollment, edition }
      }

      // No enrollment yet
      return {
        destination: edition.enrollment_open ? 'enrollment' : 'closed',
        edition,
      }
    },
    enabled: !!user,
  })

  if (isLoading) return <Loading />

  const dest = routing?.destination

  // User has project → show the empreendedor app
  if (dest === 'app') return children

  // User needs enrollment form or has pending enrollment
  if (dest === 'enrollment') return <Navigate to="/inscricao" replace />

  // Enrollments are closed and user has no access
  if (dest === 'closed' || dest === 'no-edition') return <Navigate to="/inscricao" replace />

  return children
}
