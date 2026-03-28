import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/Loading'
import {
  User, FolderKanban, ClipboardList, Brain, Stethoscope,
  Users, CalendarCheck, Calendar, BookOpen, Wrench, Sparkles,
  ChevronRight, Rocket, Target, Zap
} from 'lucide-react'

const quickActions = [
  { to: '/atividades', icon: ClipboardList, label: 'Atividades', gradient: 'from-violet-500 to-purple-600' },
  { to: '/cronograma', icon: Calendar, label: 'Agenda', gradient: 'from-blue-500 to-cyan-500' },
  { to: '/conteudos', icon: BookOpen, label: 'Conteúdos', gradient: 'from-emerald-500 to-teal-500' },
  { to: '/ferramentas', icon: Wrench, label: 'Ferramentas', gradient: 'from-orange-500 to-amber-500' },
]

const modules = [
  { to: '/projeto', icon: FolderKanban, label: 'Meu Projeto', color: 'text-purple-600 bg-purple-50' },
  { to: '/soft-skills', icon: Brain, label: 'Soft Skills', color: 'text-pink-600 bg-pink-50' },
  { to: '/diagnostico', icon: Stethoscope, label: 'Diagnóstico', color: 'text-orange-600 bg-orange-50' },
  { to: '/equipe', icon: Users, label: 'Equipe', color: 'text-teal-600 bg-teal-50' },
  { to: '/presencas', icon: CalendarCheck, label: 'Presenças', color: 'text-indigo-600 bg-indigo-50' },
]

export default function Dashboard() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: async () => {
      // Try owned project first
      const { data: owned } = await supabase.from('projects').select('*').eq('user_id', user.id).single()
      if (owned) return owned
      // Try as team member
      const { data: membership } = await supabase.from('team_members').select('project_id').eq('email', user.email).limit(1).single()
      if (membership) {
        const { data: teamProject } = await supabase.from('projects').select('*').eq('id', membership.project_id).single()
        return teamProject
      }
      return null
    },
    enabled: !!user,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', project?.id],
    queryFn: async () => {
      const { data: responses } = await supabase.from('activity_responses').select('id').eq('project_id', project.id)
      const { count: total } = await supabase.from('activities').select('*', { count: 'exact', head: true })
      const completed = responses?.length || 0
      const totalCount = total || 1
      return Math.round((completed / totalCount) * 100)
    },
    enabled: !!project,
  })

  if (isLoading) return <Loading />

  const firstName = profile?.full_name?.split(' ')[0] || 'Empreendedor'

  return (
    <div className="pb-4">
      {/* Hero gradient header */}
      <div className="bg-linear-to-br from-primary via-primary-dark to-gradient-end px-5 pt-12 pb-20 lg:pt-8 lg:rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-secondary/10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <p className="text-white/70 text-sm">Olá, {firstName} 👋</p>
          <h1 className="text-2xl font-extrabold text-white mt-1">Sua Jornada</h1>

          {/* Progress card */}
          <div className="mt-5 bg-white/15 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-white">
                  {project?.name || 'Configure seu projeto'}
                </span>
              </div>
              <span className="text-xs font-bold text-warning">{progress ?? 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-linear-to-r from-warning to-accent h-2 rounded-full transition-all duration-700"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
            <p className="text-white/60 text-[11px] mt-2">Progresso geral do programa</p>
          </div>
        </div>
      </div>

      {/* Quick actions - overlapping hero */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label, gradient }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg shadow-black/10 active:scale-95 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-text mt-2 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Target} label="Atividades" value={`${progress ?? 0}%`} color="text-primary bg-primary/10" />
          <Link to="/presencas">
            <StatCard icon={CalendarCheck} label="Presenças" value="—" color="text-secondary bg-secondary/10" />
          </Link>
          <Link to="/equipe">
            <StatCard icon={Users} label="Equipe" value="—" color="text-accent bg-accent/10" />
          </Link>
        </div>
      </div>

      {/* Modules */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-bold text-text mb-3">Explorar</h3>
        <div className="space-y-2.5">
          {modules.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3.5 bg-card rounded-2xl p-4 shadow-sm shadow-black/5 active:scale-[0.98] transition-transform border border-border/50"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-semibold">{label}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          ))}
        </div>
      </div>

      {/* AI CTA */}
      <div className="px-4 mt-6">
        <Link
          to="/ferramentas"
          className="block bg-linear-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-2xl p-5 border border-primary/10 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Assistente IA</p>
              <p className="text-xs text-text-muted">Tire dúvidas sobre seu projeto</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-2xl p-3.5 shadow-sm shadow-black/5 border border-border/50 text-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-extrabold mt-2">{value}</p>
      <p className="text-[10px] text-text-muted font-medium">{label}</p>
    </div>
  )
}
