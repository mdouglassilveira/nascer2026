import { Loader2, ArrowRight, ArrowLeft, Brain } from 'lucide-react'

const QUESTIONS = [
  { key: 'diag_experience', label: 'Experiência empreendedora', options: ['Já empreendi anteriormente', 'Primeira vez que vou empreender'] },
  { key: 'diag_team', label: 'Possui equipe', options: ['Tenho outras pessoas comigo no projeto', 'Estou fazendo o projeto sozinho'] },
  { key: 'diag_availability', label: 'Tempo disponível por semana', options: ['Mais de 8 horas semanais', 'Menos de 8 horas semanais'] },
  { key: 'diag_stage', label: 'Estágio do projeto', options: ['Já possuo MVP ou produto', 'Ainda estou trabalhando nessa ideia'] },
  { key: 'diag_model', label: 'Modelo de negócio', options: ['B2B', 'B2C', 'B2B2C', 'B2G', 'D2C', 'Ainda não defini'] },
  { key: 'diag_formalization', label: 'Formalização', options: ['Possuo CNPJ', 'Não possuo CNPJ'] },
  { key: 'diag_sales', label: 'Vendas', options: ['Já tenho cliente pagante', 'Ainda não vendi'] },
  { key: 'diag_market', label: 'Mercado e concorrência', options: ['Já estudei meu mercado e concorrentes', 'Ainda não estudei'] },
  { key: 'diag_area_experience', label: 'Experiência na área de atuação', options: ['Já atuei ou estudei na área', 'É minha primeira vez na área'] },
  { key: 'diag_clients', label: 'Lista de potenciais clientes', options: ['Possuo contatos de potenciais clientes', 'Não possuo contatos'] },
  { key: 'diag_validation', label: 'Validação com clientes', options: ['Tenho dados estruturados de validação', 'Apenas conversei informalmente'] },
  { key: 'diag_management', label: 'Controle e gestão do projeto', options: ['Uso planilhas/documentos organizados', 'Faço tudo de cabeça'] },
]

export default function Step2Profile({ form, update, onNext, onBack, saving }) {
  const answered = QUESTIONS.filter(q => form[q.key]).length
  const canProceed = answered === QUESTIONS.length

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Perfil do empreendedor</h2>
      </div>
      <p className="text-xs text-text-muted">{answered} de {QUESTIONS.length} respondidas</p>

      {QUESTIONS.map(q => (
        <div key={q.key}>
          <p className="text-sm font-semibold mb-2">{q.label}</p>
          <div className="space-y-1.5">
            {q.options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => update({ [q.key]: opt })}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  form[q.key] === opt
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-bg text-text-muted hover:bg-primary/5'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold bg-bg active:bg-border/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Próximo
        </button>
      </div>
    </div>
  )
}
