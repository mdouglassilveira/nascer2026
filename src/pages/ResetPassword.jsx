import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, Lock, CheckCircle2, Sparkles } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the token exchange automatically via the URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via password reset link - ready to set new password
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Erro ao redefinir senha. Tente novamente.')
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-secondary" />
        </div>
        <h1 className="text-xl font-bold">Senha redefinida!</h1>
        <p className="text-sm text-text-muted mt-2">Redirecionando para o app...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary via-primary-dark to-gradient-end relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-125 h-125 rounded-full bg-white/5 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg shadow-black/10">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Nascer 2026</h1>
        <p className="text-white/60 text-sm mt-2">Defina sua senha</p>
      </div>

      <div className="relative z-10 bg-white rounded-t-4xl px-6 pt-8 pb-10 shadow-2xl shadow-black/20">
        <h2 className="text-2xl font-bold mb-1">Nova senha</h2>
        <p className="text-sm text-text-muted mb-6">Crie uma senha para acessar o programa</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/60"
              placeholder="Nova senha"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/60"
              placeholder="Confirme a senha"
            />
          </div>
          {error && <p className="text-danger text-sm px-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Definir senha
          </button>
        </form>
      </div>
    </div>
  )
}
