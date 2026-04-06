import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'
import { ArrowLeft, User, Lightbulb, Brain, Shield, FileText } from 'lucide-react'

export default function EnrollmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment-detail', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, centers(name, city)')
        .eq('id', id)
        .single()
      return data
    },
  })

  const { data: evaluations } = useQuery({
    queryKey: ['enrollment-evaluations', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('evaluations')
        .select('*, evaluator:users(full_name)')
        .eq('enrollment_id', id)
      return data || []
    },
  })

  if (isLoading) return <Loading />
  if (!enrollment) return <p className="text-center py-8 text-text-muted">Inscrição não encontrada</p>

  const e = enrollment

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted font-medium mb-4 hover:text-text">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">{e.full_name || 'Sem nome'}</h1>
          <p className="text-sm text-text-muted">{e.project_title || 'Projeto não informado'}</p>
          <p className="text-xs text-text-muted mt-1">{e.centers?.name} - {e.centers?.city}</p>
        </div>
        <StatusBadge status={e.status} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Etapa 1 - Dados pessoais */}
        <Section icon={User} title="Dados pessoais">
          <Field label="Nome" value={e.full_name} />
          <Field label="Telefone" value={e.phone} />
          <Field label="Gênero" value={e.gender} />
          <Field label="Instituição de ensino" value={e.institution_linked ? (e.institution_name || 'Sim') : 'Não'} />
        </Section>

        {/* Etapa 2 - Perfil */}
        <Section icon={Brain} title="Perfil de maturidade">
          <Field label="Experiência" value={e.diag_experience} />
          <Field label="Equipe" value={e.diag_team} />
          <Field label="Disponibilidade" value={e.diag_availability} />
          <Field label="Estágio" value={e.diag_stage} />
          <Field label="Modelo" value={e.diag_model} />
          <Field label="Formalização" value={e.diag_formalization} />
          <Field label="Vendas" value={e.diag_sales} />
          <Field label="Mercado" value={e.diag_market} />
          <Field label="Área" value={e.diag_area_experience} />
          <Field label="Clientes" value={e.diag_clients} />
          <Field label="Validação" value={e.diag_validation} />
          <Field label="Gestão" value={e.diag_management} />
        </Section>

        {/* Etapa 3 - Proposta */}
        <Section icon={Lightbulb} title="Proposta" className="lg:col-span-2">
          <Field label="Título" value={e.project_title} />
          <Field label="Descrição" value={e.project_description} long />
          <Field label="Problema e solução" value={e.problem_solution} long />
          <Field label="Mercado e inovação" value={e.market_innovation} long />
          <Field label="Equipe" value={e.team_profile} long />
          <Field label="Monetização e gestão" value={e.business_model} long />
          <Field label="Links" value={e.project_link} />
        </Section>

        {/* Etapa 4 - Docs */}
        <Section icon={Shield} title="Elegibilidade">
          <Field label="Tipo" value={e.enrollment_type?.toUpperCase()} />
          <Field label="CPF" value={e.cpf} />
          {e.cnpj && <Field label="CNPJ" value={e.cnpj} />}
          <Field label="Residente SC" value={e.resident_sc ? 'Sim' : 'Não'} />
          <Field label="Endereço" value={[e.street, e.address_number, e.city, e.state].filter(Boolean).join(', ')} />
        </Section>

        {/* Avaliações */}
        <Section icon={FileText} title={`Avaliações (${evaluations?.length || 0})`}>
          {evaluations?.map(ev => (
            <div key={ev.id} className="bg-bg rounded-xl p-3 mb-2">
              <p className="text-xs font-semibold text-text-muted mb-2">
                {ev.evaluator?.full_name || 'Avaliador'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <ScoreItem label="Problema" value={ev.score_problem} />
                <ScoreItem label="Mercado" value={ev.score_market} />
                <ScoreItem label="Equipe" value={ev.score_team} />
                <ScoreItem label="Recursos" value={ev.score_resources} />
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <span className="text-xs font-semibold">Total</span>
                <span className="text-sm font-extrabold text-primary">
                  {(ev.score_problem || 0) + (ev.score_market || 0) + (ev.score_team || 0) + (ev.score_resources || 0)}/40
                </span>
              </div>
              {ev.comment && <p className="text-xs text-text-muted mt-2 italic">{ev.comment}</p>}
            </div>
          ))}
          {evaluations?.length === 0 && (
            <p className="text-xs text-text-muted py-2">Nenhuma avaliação ainda</p>
          )}
          {e.ci_score != null && (
            <div className="bg-primary/5 rounded-xl p-3 mt-2">
              <p className="text-xs font-semibold text-primary mb-1">Nota do Coordenador (CI)</p>
              <p className="text-2xl font-extrabold text-primary">{e.ci_score}/10</p>
              {e.ci_comment && <p className="text-xs text-text-muted mt-1">{e.ci_comment}</p>}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`bg-card rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, long }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-sm mt-0.5 ${long ? 'whitespace-pre-wrap' : 'truncate'}`}>{value || '—'}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    rascunho: 'bg-warning/10 text-warning',
    submetida: 'bg-info/10 text-info',
    aprovada: 'bg-secondary/10 text-secondary',
    desistente: 'bg-surface text-gray-500',
  }
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${config[status] || config.rascunho}`}>
      {status}
    </span>
  )
}

function ScoreItem({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-bold">{value ?? '—'}/10</span>
    </div>
  )
}
