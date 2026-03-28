import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProject() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['my-participation', user?.id],
    queryFn: async () => {
      // Get active edition
      const { data: edition } = await supabase
        .from('editions')
        .select('id')
        .eq('active', true)
        .single()

      if (!edition) return { project: null, participation: null, edition: null }

      // Get user's participation in this edition
      const { data: participation } = await supabase
        .from('edition_participants')
        .select('*, project:projects(*), center:centers(id, name, city)')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      return {
        project: participation?.project || null,
        participation: participation || null,
        edition,
      }
    },
    enabled: !!user,
  })

  return {
    project: data?.project || null,
    participation: data?.participation || null,
    edition: data?.edition || null,
    isLoading,
  }
}
