import Loading from '../../components/Loading'
import { useProject } from '../../hooks/useProject'
import { FolderKanban, Lightbulb, Target, TrendingUp, Layers } from 'lucide-react'

export default function Project() {
  const { project, isLoading } = useProject()

  if (isLoading) return <Loading />

  if (!project) {
    return (
      <div className="px-4 pt-4 lg:px-0">
        <div className="bg-card rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-bold text-lg">Nenhum projeto</h2>
          <p className="text-sm text-text-muted mt-1">Seu projeto será cadastrado em breve.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Project header */}
      <div className="bg-linear-to-br from-purple-500 to-violet-600 rounded-xl p-5 mb-4 shadow-lg shadow-purple-500/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-card/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{project.name}</h1>
            {project.stage && (
              <span className="inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-card/20 text-white">
                {project.stage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <DetailCard icon={Lightbulb} label="Descrição" value={project.description} color="bg-amber-50 text-amber-600" />
        <DetailCard icon={Target} label="Problema que resolve" value={project.problem} color="bg-red-50 text-red-500" />
        <DetailCard icon={TrendingUp} label="Mercado" value={project.market} color="bg-emerald-50 text-emerald-600" />
        <DetailCard icon={Layers} label="Estágio" value={project.stage} color="bg-blue-50 text-blue-600" />
      </div>
    </div>
  )
}

function DetailCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-lg shadow-ambient-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap pl-10">{value || '—'}</p>
    </div>
  )
}
