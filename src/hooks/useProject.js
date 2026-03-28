import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProject() {
  const { user } = useAuth()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: async () => {
      // Get user's project_id from their profile
      const { data: profile } = await supabase
        .from('users')
        .select('project_id')
        .eq('id', user.id)
        .single()

      if (!profile?.project_id) return null

      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', profile.project_id)
        .single()

      return proj
    },
    enabled: !!user,
  })

  return { project, isLoading }
}
