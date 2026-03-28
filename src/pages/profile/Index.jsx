import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { Save, Loader2, User, Phone, Mail, Pencil, Camera } from 'lucide-react'
import { maskPhone } from '../../lib/masks'

export default function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data
    },
    enabled: !!user,
  })

  const [form, setForm] = useState({})

  const startEditing = () => {
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    })
    setEditing(true)
  }

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('users').update(data).eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditing(false)
    },
  })

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      // Remove old avatar if exists
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      queryClient.invalidateQueries({ queryKey: ['profile'] })
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className="px-4 pt-4 lg:px-0">
      {/* Avatar header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover shadow-lg shadow-primary/20 border-3 border-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/25">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-90 transition-transform border-2 border-white"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <h2 className="text-lg font-bold mt-3">{profile?.full_name || 'Sem nome'}</h2>
        <p className="text-sm text-text-muted">{user?.email}</p>
      </div>

      {editing ? (
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}
          className="bg-card rounded-3xl shadow-sm shadow-black/5 border border-border/50 p-5 space-y-4"
        >
          <h3 className="font-bold text-sm mb-1">Editar perfil</h3>
          <InputField label="Nome completo" value={form.full_name} onChange={v => setForm(f => ({ ...f, full_name: v }))} placeholder="Seu nome completo" />
          <InputField label="Telefone" value={form.phone} type="tel" onChange={v => setForm(f => ({ ...f, phone: maskPhone(v) }))} placeholder="(00) 00000-0000" />
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Conte um pouco sobre você e seu projeto..."
              className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-text-muted/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-5 py-3 rounded-2xl text-sm font-medium bg-bg active:bg-border/50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <InfoCard icon={User} label="Nome completo" value={profile?.full_name} />
          <InfoCard icon={Mail} label="Email" value={user?.email} />
          <InfoCard icon={Phone} label="Telefone" value={profile?.phone} />

          {profile?.bio && (
            <div className="bg-card rounded-3xl shadow-sm shadow-black/5 border border-border/50 p-4">
              <p className="text-xs font-semibold text-text-muted mb-1">Bio</p>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          <button
            onClick={startEditing}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md shadow-primary/25 mt-4 active:scale-[0.98] transition-transform"
          >
            <Pencil className="w-4 h-4" />
            Editar perfil
          </button>
        </div>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm shadow-black/5 border border-border/50 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || `Informe ${label.toLowerCase()}`}
        className="w-full px-4 py-3 rounded-2xl bg-bg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted/50"
      />
    </div>
  )
}
