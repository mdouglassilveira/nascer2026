import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useAdminContext() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-context', user?.id],
    queryFn: async () => {
      const { data: edition } = await supabase
        .from('editions')
        .select('id, name')
        .eq('active', true)
        .single()

      if (!edition) return null

      const { data: participation } = await supabase
        .from('edition_participants')
        .select('role, center_id, centers(id, name, city)')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      return {
        edition,
        role: participation?.role,
        centerId: participation?.center_id,
        center: participation?.centers,
        isAdmin: participation?.role === 'admin',
        isCoordinator: participation?.role === 'coordenador',
        isEvaluator: participation?.role === 'avaliador',
      }
    },
    enabled: !!user,
  })

  return { ...data, isLoading }
}
