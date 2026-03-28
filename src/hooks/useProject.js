import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProject() {
  const { user } = useAuth()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: async () => {
      // First try: user owns a project
      const { data: owned } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (owned) return owned

      // Second try: user is a team member (match by email)
      const { data: membership } = await supabase
        .from('team_members')
        .select('project_id')
        .eq('email', user.email)
        .limit(1)
        .single()

      if (membership) {
        const { data: teamProject } = await supabase
          .from('projects')
          .select('*')
          .eq('id', membership.project_id)
          .single()
        return teamProject
      }

      return null
    },
    enabled: !!user,
  })

  return { project, isLoading }
}
