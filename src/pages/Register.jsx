import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, Sparkles, ArrowRight, Mail, Lock, User } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email já possui uma conta. Faça login.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary via-primary-dark to-gradient-end relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg shadow-black/10">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Nascer 2026</h1>
        <p className="text-white/60 text-sm mt-2">Programa de Inovação</p>
      </div>

      <div className="relative z-10 bg-white rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl shadow-black/20 min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-1">Criar conta</h2>
        <p className="text-sm text-text-muted mb-6">Cadastre-se para se inscrever no programa</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/60"
              placeholder="Seu nome completo"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/60"
              placeholder="Seu email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/60"
              placeholder="Crie uma senha (mín. 6 caracteres)"
            />
          </div>
          {error && <p className="text-danger text-sm px-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                Criar conta
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-center text-sm text-text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-semibold">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
