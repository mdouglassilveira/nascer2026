import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader2, Sparkles, ArrowRight, Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email ou senha incorretos.')
    } else {
      navigate('/')
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError('Erro ao enviar email de recuperação.')
    } else {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary-dark to-gradient-end relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />

      {/* Header area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg shadow-black/10">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Nascer 2026</h1>
        <p className="text-white/60 text-sm mt-2">Programa de Inovação</p>
      </div>

      {/* Form card */}
      <div className="relative z-10 bg-white rounded-t-4xl px-6 pt-8 pb-10 shadow-2xl shadow-black/20 min-h-[45vh] lg:rounded-2xl lg:mx-auto lg:mb-10 lg:w-full lg:max-w-md">
        {resetMode ? (
          resetSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Email enviado!</h2>
              <p className="text-sm text-text-muted">Verifique sua caixa de entrada para redefinir sua senha.</p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false) }}
                className="mt-6 text-primary font-semibold text-sm"
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-1">Recuperar senha</h2>
              <p className="text-sm text-text-muted mb-6">Enviaremos um link para seu email</p>
              <form onSubmit={handleReset} className="space-y-4">
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
                {error && <p className="text-danger text-sm px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Enviar link
                </button>
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setError('') }}
                  className="w-full text-sm text-text-muted font-medium py-2"
                >
                  Voltar ao login
                </button>
              </form>
            </div>
          )
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-1">Bem-vindo!</h2>
            <p className="text-sm text-text-muted mb-6">Entre para acessar sua jornada</p>
            <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="Sua senha"
                />
              </div>
              {error && <p className="text-danger text-sm px-1">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(true); setError('') }}
                className="w-full text-sm text-text-muted font-medium py-2"
              >
                Esqueci minha senha
              </button>
              <p className="text-center text-sm text-text-muted mt-3">
                Não tem conta?{' '}
                <Link to="/registro" className="text-primary font-semibold">Cadastre-se</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
