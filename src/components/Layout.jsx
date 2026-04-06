import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import {
  LayoutDashboard, User, FolderKanban, ClipboardList, Brain,
  Stethoscope, Users, CalendarCheck, Calendar, BookOpen,
  Wrench, LogOut, ChevronRight, Sparkles, X
} from 'lucide-react'
import { useState } from 'react'

const bottomNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/atividades', icon: ClipboardList, label: 'Atividades' },
  { to: '/cronograma', icon: Calendar, label: 'Agenda' },
  { to: '/conteudos', icon: BookOpen, label: 'Conteúdos' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

const moreItems = [
  { to: '/projeto', icon: FolderKanban, label: 'Meu Projeto', desc: 'Detalhes e progresso' },
  { to: '/soft-skills', icon: Brain, label: 'Soft Skills', desc: 'Avalie suas competências' },
  { to: '/diagnostico', icon: Stethoscope, label: 'Diagnóstico', desc: 'Maturidade do projeto' },
  { to: '/equipe', icon: Users, label: 'Equipe', desc: 'Gerencie seu time' },
  { to: '/presencas', icon: CalendarCheck, label: 'Presenças', desc: 'Histórico de encontros' },
  { to: '/ferramentas', icon: Wrench, label: 'Ferramentas', desc: 'Assistente IA e materiais' },
]

export default function Layout() {
  const { signOut, user } = useAuth()
  
  const navigate = useNavigate()
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Top bar - mobile (glassmorphism) */}
      <header className="lg:hidden sticky top-0 z-30 glass">
        <div className="flex items-center justify-between px-5 py-3.5">
          <h1 className="text-lg font-bold text-primary">{pageTitle}</h1>
          <button onClick={() => setShowMore(true)} className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
        </div>
      </header>

      {/* Desktop sidebar (tonal layering, no border) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-72 bg-card flex-col z-40 shadow-ambient">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-gradient-end flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-text">Nascer 2026</h2>
              <p className="text-[11px] text-text-muted">Programa de Inovação</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {[...bottomNavItems.filter(i => i.to !== '/perfil'), ...moreItems].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-text-muted hover:bg-surface hover:text-text'
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-3 rounded-lg bg-surface">
          <div className="flex items-center gap-3 min-w-0 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-danger hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* More menu overlay - mobile */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-lg font-bold">Menu</h3>
              <button onClick={() => setShowMore(false)} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-8 space-y-1">
              {moreItems.map(({ to, icon: Icon, label, desc }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all
                    ${isActive ? 'bg-primary/10' : 'hover:bg-gray-50 active:bg-gray-100'}
                  `}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-primary/10 to-primary/5`}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </NavLink>
              ))}

              <div className="border-t border-border mt-3 pt-3">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-lg w-full hover:bg-red-50 active:bg-red-100"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-danger/10">
                    <LogOut className="w-5 h-5 text-danger" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-danger">Sair</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-72 pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass">
        <div className="flex justify-around items-center px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {bottomNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[56px]
                ${isActive
                  ? 'text-primary'
                  : 'text-text-muted'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function getPageTitle(path) {
  const titles = {
    '/': 'Nascer 2026',
    '/perfil': 'Meu Perfil',
    '/projeto': 'Meu Projeto',
    '/atividades': 'Atividades',
    '/soft-skills': 'Soft Skills',
    '/diagnostico': 'Diagnóstico',
    '/equipe': 'Equipe',
    '/presencas': 'Presenças',
    '/cronograma': 'Agenda',
    '/conteudos': 'Conteúdos',
    '/ferramentas': 'Ferramentas',
  }
  return titles[path] || 'Nascer 2026'
}
