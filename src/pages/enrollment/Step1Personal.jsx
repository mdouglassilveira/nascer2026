import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Loader2, ArrowRight, User } from 'lucide-react'

export default function Step1Personal({ form, update, onNext, saving }) {
  const { data: centers } = useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const { data } = await supabase.from('centers').select('id, name, city').order('city')
      return data || []
    },
  })

  const canProceed = form.full_name && form.phone && form.gender && form.center_id

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Dados pessoais</h2>
      </div>

      <Field label="Nome completo">
        <input
          type="text"
          value={form.full_name || ''}
          onChange={e => update({ full_name: e.target.value })}
          placeholder="Seu nome completo"
          className="input-field"
        />
      </Field>

      <Field label="Telefone">
        <input
          type="tel"
          value={form.phone || ''}
          onChange={e => update({ phone: e.target.value })}
          placeholder="(00) 00000-0000"
          className="input-field"
        />
      </Field>

      <Field label="Gênero">
        <select
          value={form.gender || ''}
          onChange={e => update({ gender: e.target.value })}
          className="input-field"
        >
          <option value="">Selecione seu gênero</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
          <option value="prefiro_nao_informar">Prefiro não informar</option>
        </select>
      </Field>

      <Field label="Centro de Inovação">
        <select
          value={form.center_id || ''}
          onChange={e => update({ center_id: e.target.value })}
          className="input-field"
        >
          <option value="">Selecione seu centro de inovação</option>
          {centers?.map(c => (
            <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
          ))}
        </select>
      </Field>

      <Field label="Vinculado a instituição de ensino superior?">
        <select
          value={form.institution_linked === true ? 'sim' : form.institution_linked === false ? 'nao' : ''}
          onChange={e => update({
            institution_linked: e.target.value === 'sim',
            institution_name: e.target.value === 'nao' ? '' : form.institution_name
          })}
          className="input-field"
        >
          <option value="">Selecione uma opção</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </Field>

      {form.institution_linked && (
        <Field label="Nome da instituição">
          <input
            type="text"
            value={form.institution_name || ''}
            onChange={e => update({ institution_name: e.target.value })}
            placeholder="Nome da instituição de ensino"
            className="input-field"
          />
        </Field>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || saving}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-40 active:scale-[0.98] transition-transform mt-4"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        Próximo
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
