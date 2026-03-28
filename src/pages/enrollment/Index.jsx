import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEnrollment } from '../../hooks/useEnrollment'
import Loading from '../../components/Loading'
import Step1Personal from './Step1Personal'
import Step2Profile from './Step2Profile'
import Step3Proposal from './Step3Proposal'
import Step4Eligibility from './Step4Eligibility'
import { Sparkles, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { label: 'Dados pessoais', component: Step1Personal },
  { label: 'Perfil', component: Step2Profile },
  { label: 'Proposta', component: Step3Proposal },
  { label: 'Elegibilidade', component: Step4Eligibility },
]

export default function Enrollment() {
  const { enrollment, edition, isLoading, save, saving, submit, submitting, uploadDoc } = useEnrollment()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (enrollment) {
      setForm(enrollment)
      setStep(enrollment.form_step || 0)
    }
  }, [enrollment?.id])

  if (isLoading) return <Loading />

  if (!edition?.enrollment_open) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-center">Inscrições encerradas</h1>
        <p className="text-sm text-text-muted mt-2 text-center">
          As inscrições para o {edition?.name || 'Programa Nascer'} não estão abertas no momento.
        </p>
      </div>
    )
  }

  if (enrollment?.status === 'submetida') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-secondary" />
        </div>
        <h1 className="text-xl font-bold text-center">Inscrição enviada!</h1>
        <p className="text-sm text-text-muted mt-2 text-center">
          Sua inscrição foi recebida e está em análise. Acompanhe o status pelo app.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  const update = (fields) => setForm(f => ({ ...f, ...fields }))

  const goNext = async () => {
    await save({ ...form, form_step: step + 1 })
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    await save(form)
    await submit()
  }

  const StepComponent = STEPS[step].component

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-linear-to-br from-primary via-primary-dark to-gradient-end px-5 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Inscrição</p>
          <h1 className="text-2xl font-extrabold text-white mt-1">{edition?.name}</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all ${
                  i < step ? 'bg-secondary' : i === step ? 'bg-white' : 'bg-white/20'
                }`} />
                <span className={`text-[9px] font-medium ${
                  i <= step ? 'text-white' : 'text-white/40'
                }`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-5 -mt-3">
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm shadow-black/5 p-5">
          <StepComponent
            form={form}
            update={update}
            onNext={goNext}
            onBack={goBack}
            onSubmit={handleSubmit}
            saving={saving}
            submitting={submitting}
            uploadDoc={uploadDoc}
          />
        </div>
      </div>
    </div>
  )
}
