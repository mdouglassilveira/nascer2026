import { Loader2, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react'

const FIELDS = [
  { key: 'project_title', label: 'Título do projeto', type: 'input', limit: 50, required: true, placeholder: 'Nome do seu projeto' },
  { key: 'project_description', label: 'Descrição do projeto', type: 'textarea', limit: 300, required: true, placeholder: 'Descreva brevemente o que é seu projeto...' },
  { key: 'problem_solution', label: 'Problema e solução', type: 'textarea', limit: 1000, required: true, placeholder: 'Qual problema você resolve e como é sua solução?' },
  { key: 'market_innovation', label: 'Mercado e inovação', type: 'textarea', limit: 1000, required: true, placeholder: 'Qual é o mercado-alvo e o que há de inovador no projeto?' },
  { key: 'team_profile', label: 'Equipe', type: 'textarea', limit: 1000, required: true, placeholder: 'Quem faz parte da equipe e quais são as competências?' },
  { key: 'business_model', label: 'Monetização e gestão', type: 'textarea', limit: 1000, required: true, placeholder: 'Como pretende monetizar e gerir o negócio?' },
  { key: 'project_link', label: 'Links do projeto', type: 'input', limit: 500, required: false, placeholder: 'Site, redes sociais, protótipo... (opcional)' },
]

export default function Step3Proposal({ form, update, onNext, onBack, saving }) {
  const requiredFilled = FIELDS.filter(f => f.required).every(f => form[f.key]?.trim())

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Sua proposta</h2>
      </div>
      <p className="text-xs text-text-muted">Descreva seu projeto com detalhes. Esses dados serão avaliados.</p>

      {FIELDS.map(f => (
        <div key={f.key}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {f.label} {!f.required && <span className="text-text-muted/50 normal-case">(opcional)</span>}
            </label>
            {f.limit && (
              <span className={`text-[10px] font-medium ${
                (form[f.key]?.length || 0) > f.limit ? 'text-danger' : 'text-text-muted/50'
              }`}>
                {form[f.key]?.length || 0}/{f.limit}
              </span>
            )}
          </div>
          {f.type === 'textarea' ? (
            <textarea
              value={form[f.key] || ''}
              onChange={e => update({ [f.key]: e.target.value })}
              maxLength={f.limit}
              rows={4}
              placeholder={f.placeholder}
              className="input-field resize-none"
            />
          ) : (
            <input
              type="text"
              value={form[f.key] || ''}
              onChange={e => update({ [f.key]: e.target.value })}
              maxLength={f.limit}
              placeholder={f.placeholder}
              className="input-field"
            />
          )}
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
          disabled={!requiredFilled || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Próximo
        </button>
      </div>
    </div>
  )
}
