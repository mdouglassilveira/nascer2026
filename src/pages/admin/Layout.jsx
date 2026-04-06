import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdminContext } from '../../hooks/useAdminContext'
import { useDarkMode } from '../../hooks/useDarkMode'
import { LayoutDashboard, ClipboardList, Award, Users, LogOut, Sparkles, MapPin, Sun, Moon } from 'lucide-react'

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const ctx = useAdminContext()
  const { dark, toggle: toggleDark } = useDarkMode()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, show: true },
    { to: '/admin/inscricoes', icon: ClipboardList, label: 'Inscrições', show: true },
    { to: '/admin/avaliacoes', icon: Award, label: 'Avaliar', show: ctx?.isAdmin || ctx?.isEvaluator },
    { to: '/admin/ranking', icon: Users, label: 'Ranking', show: true },
  ]

  const roleLabel = {
    admin: 'Admin',
    coordenador: 'Coordenador',
    avaliador: 'Avaliador',
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Top bar */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-gradient-end flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Nascer 2026</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {roleLabel[ctx?.role] || 'Staff'}
            </span>
            {ctx?.isCoordinator && ctx.center && (
              <span className="text-[10px] font-medium text-text-muted hidden sm:flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {ctx.center.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">{user?.email}</span>
            <button onClick={toggleDark} className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center">
              {dark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-text-muted" />}
            </button>
            <button onClick={handleSignOut} className="text-text-muted hover:text-danger">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="bg-card border-b border-border/50">
        <div className="max-w-6xl mx-auto flex gap-1 px-4 overflow-x-auto">
          {navItems.filter(n => n.show).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
