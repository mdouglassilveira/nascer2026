import { useState } from 'react'
import { maskCPF, maskCNPJ, maskCEP } from '../../lib/masks'
import { Loader2, ArrowLeft, Send, Upload, FileCheck, Shield } from 'lucide-react'

const ELIG_QUESTIONS = [
  { key: 'elig_company_age', label: 'A empresa tem menos de 12 meses de CNPJ?' },
  { key: 'elig_revenue', label: 'Faturamento anual é menor ou igual a R$ 81.000?' },
  { key: 'elig_compatible', label: 'A ideia é compatível com o objeto social do CNPJ?' },
  { key: 'elig_partner', label: 'Você é sócio constante no contrato social?' },
  { key: 'elig_cnpj_sc', label: 'O CNPJ está registrado em Santa Catarina?' },
]

export default function Step4Eligibility({ form, update, onBack, onSubmit, saving, submitting, uploadDoc }) {
  const [uploading, setUploading] = useState({})

  const handleUpload = async (file, docType, fieldName) => {
    if (!file) return
    setUploading(u => ({ ...u, [fieldName]: true }))
    try {
      const url = await uploadDoc(file, docType)
      update({ [fieldName]: url })
    } catch (e) {
      console.error('Upload error:', e)
    }
    setUploading(u => ({ ...u, [fieldName]: false }))
  }

  const handleCep = async () => {
    if (!form.cep || form.cep.length < 8) return
    try {
      const cleanCep = form.cep.replace(/\D/g, '')
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        update({
          street: data.logradouro || '',
          city: data.localidade || '',
          state: data.uf || '',
          address: `${data.logradouro}, ${data.localidade} - ${data.uf}`,
        })
      }
    } catch {}
  }

  const isCnpj = form.enrollment_type === 'cnpj'
  const allEligOk = isCnpj ? ELIG_QUESTIONS.every(q => form[q.key] === true) : true
  const showCnpjWarning = isCnpj && ELIG_QUESTIONS.some(q => form[q.key] === false)

  const canSubmit = form.enrollment_type
    && form.cpf
    && form.accepted_rules
    && (isCnpj ? (form.cnpj && allEligOk) : true)

  return (
    <div className="space-y-6">
      {/* Tipo de inscrição */}
      <Section icon={Shield} title="Tipo de inscrição">
        <select
          value={form.enrollment_type || ''}
          onChange={e => update({ enrollment_type: e.target.value })}
          className="input-field"
        >
          <option value="">Como deseja se inscrever?</option>
          <option value="cpf">Pessoa Física (CPF)</option>
          <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
        </select>
      </Section>

      {/* Elegibilidade CNPJ */}
      {isCnpj && (
        <Section title="Regras de elegibilidade (CNPJ)">
          <div className="space-y-3">
            {ELIG_QUESTIONS.map(q => (
              <div key={q.key} className="flex items-center justify-between gap-3">
                <p className="text-sm flex-1">{q.label}</p>
                <div className="flex gap-1.5 shrink-0">
                  {['Sim', 'Não'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update({ [q.key]: opt === 'Sim' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        form[q.key] === (opt === 'Sim')
                          ? opt === 'Sim' ? 'bg-secondary text-white' : 'bg-danger text-white'
                          : 'bg-bg text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showCnpjWarning && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mt-3">
              <p className="text-xs text-warning font-medium">
                Sua empresa não atende todos os requisitos para inscrição como CNPJ. Considere se inscrever como CPF.
              </p>
            </div>
          )}
        </Section>
      )}

      {/* Dados PJ */}
      {isCnpj && allEligOk && (
        <Section title="Dados da empresa">
          <Field label="Tempo de existência do CNPJ">
            <select value={form.company_time || ''} onChange={e => update({ company_time: e.target.value })} className="input-field">
              <option value="">Selecione</option>
              <option value="menos_3_meses">Menos de 3 meses</option>
              <option value="3_6_meses">3 a 6 meses</option>
              <option value="6_12_meses">6 a 12 meses</option>
            </select>
          </Field>
          <Field label="CNPJ">
            <input type="text" value={form.cnpj || ''} onChange={e => update({ cnpj: maskCNPJ(e.target.value) })} placeholder="00.000.000/0000-00" className="input-field" />
          </Field>
          <FileUpload label="Contrato Social" field="doc_social_contract_url" form={form} uploading={uploading} onUpload={(f) => handleUpload(f, 'contrato-social', 'doc_social_contract_url')} />
          <FileUpload label="Cartão CNPJ" field="doc_cnpj_card_url" form={form} uploading={uploading} onUpload={(f) => handleUpload(f, 'cartao-cnpj', 'doc_cnpj_card_url')} />
          <FileUpload label="DRE" field="doc_dre_url" form={form} uploading={uploading} onUpload={(f) => handleUpload(f, 'dre', 'doc_dre_url')} />
        </Section>
      )}

      {/* Dados pessoais finais */}
      {form.enrollment_type && (
        <Section title="Dados pessoais">
          <Field label="CPF">
            <input type="text" value={form.cpf || ''} onChange={e => update({ cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" className="input-field" />
          </Field>
          <FileUpload label="Documento de identidade" field="doc_identity_url" form={form} uploading={uploading} onUpload={(f) => handleUpload(f, 'identidade', 'doc_identity_url')} />

          <Field label="Residente em Santa Catarina?">
            <select value={form.resident_sc === true ? 'sim' : form.resident_sc === false ? 'nao' : ''} onChange={e => update({ resident_sc: e.target.value === 'sim' })} className="input-field">
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Field>
        </Section>
      )}

      {/* Endereço */}
      {form.enrollment_type && (
        <Section title="Endereço">
          <Field label="CEP">
            <div className="flex gap-2">
              <input type="text" value={form.cep || ''} onChange={e => update({ cep: maskCEP(e.target.value) })} placeholder="00000-000" className="input-field flex-1" />
              <button type="button" onClick={handleCep} className="px-4 py-3 rounded-2xl bg-primary/10 text-primary text-xs font-bold active:bg-primary/20">
                Buscar
              </button>
            </div>
          </Field>
          <Field label="Cidade">
            <input type="text" value={form.city || ''} onChange={e => update({ city: e.target.value })} placeholder="Cidade" className="input-field" />
          </Field>
          <Field label="UF">
            <input type="text" value={form.state || ''} onChange={e => update({ state: e.target.value })} placeholder="SC" maxLength={2} className="input-field" />
          </Field>
          <Field label="Logradouro">
            <input type="text" value={form.street || ''} onChange={e => update({ street: e.target.value })} placeholder="Rua, Av, etc." className="input-field" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Número">
              <input type="text" value={form.address_number || ''} onChange={e => update({ address_number: e.target.value })} placeholder="Nº" className="input-field" />
            </Field>
            <Field label="Complemento">
              <input type="text" value={form.address_complement || ''} onChange={e => update({ address_complement: e.target.value })} placeholder="Apto, sala..." className="input-field" />
            </Field>
          </div>
          <FileUpload label="Comprovante de residência" field="doc_residence_url" form={form} uploading={uploading} onUpload={(f) => handleUpload(f, 'comprovante-residencia', 'doc_residence_url')} />
        </Section>
      )}

      {/* Aceite */}
      {form.enrollment_type && (
        <Section title="Termos">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accepted_rules || false}
              onChange={e => update({ accepted_rules: e.target.checked })}
              className="w-5 h-5 rounded border-border mt-0.5 accent-primary"
            />
            <span className="text-sm">
              Li e aceito os termos do edital do programa
            </span>
          </label>
        </Section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold bg-bg active:bg-border/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-secondary to-secondary-dark text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-secondary/25 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Finalizar inscrição
        </button>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
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

function FileUpload({ label, field, form, uploading, onUpload }) {
  const hasFile = !!form[field]
  return (
    <div>
      <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {hasFile ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/10 text-secondary text-sm font-medium">
          <FileCheck className="w-4 h-4" />
          Documento enviado
          <button
            type="button"
            onClick={() => document.getElementById(`file-${field}`).click()}
            className="ml-auto text-xs underline"
          >
            Trocar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => document.getElementById(`file-${field}`).click()}
          disabled={uploading[field]}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-border text-text-muted text-sm font-medium hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading[field] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading[field] ? 'Enviando...' : 'Selecionar arquivo'}
        </button>
      )}
      <input
        id={`file-${field}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => onUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}
