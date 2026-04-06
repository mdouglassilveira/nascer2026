import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every 5 minutes
      if (r) {
        setInterval(() => r.update(), 5 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-50 animate-slide-up">
      <div className="bg-card rounded-lg shadow-xl shadow-black/15 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Nova versão disponível</p>
          <p className="text-xs text-text-muted">Atualize para a versão mais recente</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold active:scale-95 transition-transform"
          >
            Atualizar
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
