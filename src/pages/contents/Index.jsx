import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'
import { BookOpen, Play, FileText, ChevronRight } from 'lucide-react'

export default function Contents() {
  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const { data } = await supabase.from('contents').select('*').order('module').order('order_index')
      return data || []
    },
  })

  if (isLoading) return <Loading />

  const grouped = contents?.reduce((acc, item) => {
    const mod = item.module || 'Geral'
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(item)
    return acc
  }, {})

  const moduleColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ]

  return (
    <div className="px-4 pt-4 lg:px-0">
      {Object.entries(grouped || {}).map(([module, items], mi) => (
        <div key={module} className="mb-6">
          <div className={`bg-linear-to-r ${moduleColors[mi % moduleColors.length]} rounded-2xl px-4 py-3 mb-3 shadow-sm`}>
            <h2 className="text-white font-bold text-sm">{module}</h2>
            <p className="text-white/60 text-xs">{items.length} {items.length === 1 ? 'conteúdo' : 'conteúdos'}</p>
          </div>
          <div className="space-y-2.5">
            {items.map(item => (
              <Link
                key={item.id}
                to={`/conteudos/${item.id}`}
                className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3.5 shadow-sm shadow-black/5 active:scale-[0.98] transition-transform"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'video' ? 'bg-purple-50 text-purple-500' : 'bg-cyan-50 text-cyan-500'
                }`}>
                  {item.type === 'video' ? <Play className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-text-muted truncate mt-0.5">{item.description}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {(!contents || contents.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-muted font-medium">Nenhum conteúdo disponível</p>
        </div>
      )}
    </div>
  )
}
