import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useEnrollment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get active edition
  const { data: edition } = useQuery({
    queryKey: ['active-edition'],
    queryFn: async () => {
      const { data } = await supabase.from('editions').select('*').eq('active', true).single()
      return data
    },
  })

  // Get or create enrollment for current user + active edition
  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment', user?.id, edition?.id],
    queryFn: async () => {
      const { data: existing } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('edition_id', edition.id)
        .single()

      if (existing) return existing

      // Auto-create draft enrollment
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()

      const { data: created } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          edition_id: edition.id,
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          status: 'rascunho',
          form_step: 0,
        })
        .select()
        .single()

      return created
    },
    enabled: !!user && !!edition,
  })

  // Save form data (partial save)
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('enrollments')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', enrollment.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] })
    },
  })

  // Submit enrollment
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'submetida', submitted_at: new Date().toISOString() })
        .eq('id', enrollment.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] })
    },
  })

  // Upload document
  const uploadDoc = async (file, docType) => {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${docType}.${ext}`

    const { error } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    return publicUrl
  }

  return {
    enrollment,
    edition,
    isLoading,
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
    submit: submitMutation.mutateAsync,
    submitting: submitMutation.isPending,
    uploadDoc,
  }
}
