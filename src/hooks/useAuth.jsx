import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      // Mark user as ativo on any login/recovery event
      if ((_event === 'SIGNED_IN' || _event === 'PASSWORD_RECOVERY' || _event === 'USER_UPDATED') && session?.user) {
        // Update both users.status and edition_participants.status
        supabase.from('users').update({ status: 'ativo' }).eq('id', session.user.id).eq('status', 'convidado').then(() => {})
        supabase.from('edition_participants').update({ status: 'ativo' }).eq('user_id', session.user.id).eq('status', 'convidado').then(() => {})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email)

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
